import axios from 'axios'
import useAuthStore from '../store/useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

// 일반 API 호출에 사용하는 공통 axios 인스턴스입니다.
// withCredentials: true를 켜두면 refresh cookie가 필요한 요청에도 쿠키가 자동 포함됩니다.
const customAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// 동시에 여러 요청이 401을 받아도 refresh는 한 번만 보내고,
// 나머지 요청은 refresh 결과를 기다렸다가 다시 재시도하기 위한 상태입니다.
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
      return
    }

    resolve(token)
  })

  failedQueue = []
}

customAxios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken

    // access token은 메모리에만 있으므로 요청 직전에 store에서 꺼내 헤더에 붙입니다.
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

customAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!error.response) {
      return Promise.reject(error)
    }

    // 인증 관련 API 자체에서 난 에러는 여기서 refresh 재시도를 걸지 않습니다.
    // 그렇지 않으면 /auth/refresh 실패 -> 다시 refresh 시도 같은 루프가 생길 수 있습니다.
    if (
      originalRequest?.url?.includes('/auth/session') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/logout')
    ) {
      return Promise.reject(error)
    }

    // 이미 한 번 재시도한 요청이거나 401이 아니면 그대로 에러를 반환합니다.
    if (originalRequest?.retry || error.response.status !== 401) {
      return Promise.reject(error)
    }

    // 다른 요청이 이미 refresh 중이면 이 요청은 큐에 넣고 결과만 기다립니다.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return customAxios(originalRequest)
        })
        .catch((queueError) => Promise.reject(queueError))
    }

    originalRequest.retry = true
    isRefreshing = true

    try {
      // refresh 책임은 store에 있으므로 인터셉터는 store action만 호출합니다.
      // refresh 실패 시에는 다른 탭에도 로그아웃을 전파하도록 옵션을 켭니다.
      const { accessToken: newAccessToken } = await useAuthStore
        .getState()
        .refreshAccessToken({ broadcastOnFailure: true })

      // 대기 중이던 요청들에게 새 토큰을 전달합니다.
      processQueue(null, newAccessToken)

      // 현재 실패한 원본 요청도 새 토큰으로 다시 보냅니다.
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return customAxios(originalRequest)
    } catch (refreshError) {
      // refresh 자체가 실패하면 대기 중 요청도 모두 실패 처리합니다.
      processQueue(refreshError)
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default customAxios
