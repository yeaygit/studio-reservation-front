import axios from 'axios'
import { create } from 'zustand'
import { getApiErrorMessage } from '../utils/apiError'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const AUTH_SYNC_CHANNEL_NAME = 'studio-auth-sync'
const AUTH_SYNC_STORAGE_KEY = 'studio-auth-sync-event'

type AuthSyncEventType = 'LOGIN' | 'LOGOUT'
type AuthMember = Record<string, unknown> | null

interface AuthResponseData {
  accessToken?: string
  member?: AuthMember
  admin?: AuthMember
  authenticated?: boolean
  [key: string]: unknown
}

interface SyncMessage {
  type: AuthSyncEventType
  tabId: string
  timestamp: number
}

interface SetAuthPayload {
  accessToken?: string | null
  member?: AuthMember
}

interface LoginPayload {
  username: string
  password: string
}

interface ClearAuthOptions {
  broadcast?: boolean
}

interface RefreshAccessTokenOptions {
  broadcastOnFailure?: boolean
}

interface RefreshResult {
  accessToken: string
  data: AuthResponseData
}

interface AuthSyncHandlers {
  onLogin?: () => void | Promise<void>
  onLogout?: () => void
}

export interface AuthState {
  accessToken: string
  member: AuthMember
  isAuthReady: boolean
  setAuth: (payload: SetAuthPayload) => void
  setAccessToken: (accessToken?: string | null) => void
  setMember: (member: AuthMember) => void
  clearAuth: (options?: ClearAuthOptions) => void
  refreshAccessToken: (options?: RefreshAccessTokenOptions) => Promise<RefreshResult>
  restoreSession: () => Promise<boolean>
  login: (payload: LoginPayload) => Promise<AuthResponseData>
  logout: () => Promise<void>
}

type BasicAuthState = Pick<AuthState, 'accessToken' | 'member' | 'isAuthReady'>

// 인증 전용 axios 인스턴스다.
// withCredentials: true 덕분에 HttpOnly refresh cookie가 자동으로 포함된다.
const authAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// 로그아웃 상태의 기본값이다.
const emptyAuthState: Pick<AuthState, 'accessToken' | 'member'> = {
  accessToken: '',
  member: null,
}

// 앱이 처음 켜졌을 때는 아직 세션 복구 여부를 모르므로
// isAuthReady를 false로 두고 라우팅 결정을 잠시 보류한다.
const initialState: BasicAuthState = {
  ...emptyAuthState,
  isAuthReady: false,
}

// 탭마다 고유 ID를 만들어 자기 자신이 보낸 브로드캐스트는 무시한다.
const AUTH_TAB_ID =
  globalThis.crypto?.randomUUID?.() ??
  `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`

// 동시에 여러 곳에서 refresh를 요청해도 /auth/refresh는 한 번만 호출되도록
// 현재 진행 중인 Promise를 공유한다.
let refreshPromise: Promise<RefreshResult> | null = null
let shouldBroadcastRefreshFailure = false

const setLoggedOutState = (setState: (partial: Partial<AuthState>) => void): void => {
  setState({
    ...emptyAuthState,
    isAuthReady: true,
  })
}

const createSyncMessage = (type: AuthSyncEventType): SyncMessage => ({
  type,
  tabId: AUTH_TAB_ID,
  timestamp: Date.now(),
})

const broadcastAuthSync = (type: AuthSyncEventType): void => {
  if (typeof window === 'undefined') {
    return
  }

  const browserWindow: Window & typeof globalThis = window
  const message = createSyncMessage(type)

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME)
    channel.postMessage(message)
    channel.close()
    return
  }

  // BroadcastChannel을 지원하지 않는 경우 localStorage 이벤트로 대체한다.
  browserWindow.localStorage.setItem(AUTH_SYNC_STORAGE_KEY, JSON.stringify(message))
  browserWindow.localStorage.removeItem(AUTH_SYNC_STORAGE_KEY)
}

const parseSyncMessage = (message: unknown): SyncMessage | null => {
  if (!message) {
    return null
  }

  if (typeof message === 'string') {
    try {
      return JSON.parse(message) as SyncMessage
    } catch {
      return null
    }
  }

  return message as SyncMessage
}

// 다른 탭에서 발생한 로그인/로그아웃 이벤트를 구독한다.
export const subscribeToAuthSync = ({ onLogin, onLogout }: AuthSyncHandlers): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const browserWindow: Window & typeof globalThis = window

  const handleMessage = (rawMessage: unknown): void => {
    const message = parseSyncMessage(rawMessage)

    if (!message || message.tabId === AUTH_TAB_ID) {
      return
    }

    if (message.type === 'LOGIN') {
      void onLogin?.()
      return
    }

    if (message.type === 'LOGOUT') {
      onLogout?.()
    }
  }

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL_NAME)
    channel.onmessage = ({ data }) => handleMessage(data)

    return () => {
      channel.close()
    }
  }

  const handleStorage = (event: StorageEvent): void => {
    if (event.key !== AUTH_SYNC_STORAGE_KEY || !event.newValue) {
      return
    }

    handleMessage(event.newValue)
  }

  browserWindow.addEventListener('storage', handleStorage)

  return () => {
    browserWindow.removeEventListener('storage', handleStorage)
  }
}

// 익명 사용자도 200 OK를 받는 세션 확인 API다.
// true면 refresh를 시도할 가치가 있는 상태이고, false면 바로 비로그인 처리한다.
const checkSession = async (): Promise<boolean> => {
  const response = await authAxios.get<AuthResponseData>('/auth/session')
  return Boolean(response.data?.authenticated)
}

const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  // 한 응답에서 access token과 사용자 정보를 같이 받았을 때 한 번에 저장한다.
  setAuth: ({ accessToken, member = null }: SetAuthPayload) =>
    set({
      accessToken: accessToken ?? '',
      member,
      isAuthReady: true,
    }),

  // 사용자 정보는 그대로 두고 access token만 교체할 때 사용한다.
  setAccessToken: (accessToken?: string | null) =>
    set((state) => ({
      accessToken: accessToken ?? '',
      member: state.member,
      isAuthReady: true,
    })),

  setMember: (member: AuthMember) =>
    set((state) => ({
      member,
      isAuthReady: state.isAuthReady,
    })),

  // 현재 탭 인증 상태를 지우고, 필요하면 다른 탭에도 로그아웃을 알린다.
  clearAuth: ({ broadcast = true }: ClearAuthOptions = {}) => {
    setLoggedOutState(set)

    if (broadcast) {
      broadcastAuthSync('LOGOUT')
    }
  },

  // refresh cookie를 이용해 새 access token을 발급받고 메모리에 저장한다.
  // 실패 시에는 현재 탭 인증 상태를 비우고, 옵션에 따라 다른 탭에도 로그아웃을 전파한다.
  refreshAccessToken: async ({ broadcastOnFailure = false }: RefreshAccessTokenOptions = {}) => {
    shouldBroadcastRefreshFailure ||= broadcastOnFailure

    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = (async () => {
      try {
        const response = await authAxios.post<AuthResponseData>('/auth/refresh')
        const data = response.data
        const accessToken = data?.accessToken

        if (!accessToken) {
          throw new Error('Refresh API did not return an access token.')
        }

        set((state) => ({
          accessToken,
          member: data?.member ?? data?.admin ?? state.member,
          isAuthReady: true,
        }))

        return {
          accessToken,
          data,
        }
      } catch (error) {
        get().clearAuth({ broadcast: shouldBroadcastRefreshFailure })
        throw error
      } finally {
        refreshPromise = null
        shouldBroadcastRefreshFailure = false
      }
    })()

    return refreshPromise
  },

  // 앱 시작 시 세션 복구를 시도한다.
  // 1. 메모리에 access token이 있으면 그대로 인증 완료
  // 2. 없으면 /auth/session으로 복구 가능한 상태인지 먼저 확인
  // 3. authenticated=true일 때만 /auth/refresh를 호출
  restoreSession: async () => {
    if (get().accessToken) {
      set((state) => ({
        ...state,
        isAuthReady: true,
      }))
      return true
    }

    try {
      const authenticated = await checkSession()

      if (!authenticated) {
        setLoggedOutState(set)
        return false
      }

      await get().refreshAccessToken()
      return true
    } catch {
      setLoggedOutState(set)
      return false
    }
  },

  // 로그인 성공 시 access token은 메모리에만 저장한다.
  // refresh token은 서버가 HttpOnly cookie로 내려준다고 가정한다.
  login: async ({ username, password }: LoginPayload) => {
    const payload = { username, password }

    try {
      const response = await authAxios.post<AuthResponseData>('/auth/login', payload)
      const data = response.data
      const accessToken = data?.accessToken

      if (!accessToken) {
        throw new Error('Login API did not return an access token.')
      }

      set({
        accessToken,
        member: data?.member ?? data?.admin ?? null,
        isAuthReady: true,
      })

      // 다른 탭은 token을 직접 받지 않고, 이 신호를 받은 뒤 각자 복구를 시도한다.
      broadcastAuthSync('LOGIN')

      return data
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, '로그인에 실패했습니다. 아이디와 비밀번호를 다시 확인해주세요.'),
      )
    }
  },

  // 서버 로그아웃 후 현재 탭 메모리를 비운다.
  logout: async () => {
    try {
      const accessToken = get().accessToken
      const headers = accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined

      await authAxios.post('/auth/logout', null, { headers })
      get().clearAuth()
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(error, '로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.'),
      )
    }
  },
}))

export const selectIsAuthenticated = (state: AuthState): boolean => Boolean(state.accessToken)
export const selectIsAuthReady = (state: AuthState): boolean => state.isAuthReady

export default useAuthStore
