import axios from 'axios'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const authAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const initialState = {
  accessToken: '',
  member: null,
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      setAuth: ({ accessToken, member = null }) =>
        set({
          accessToken: accessToken ?? '',
          member,
        }),
      setAccessToken: (accessToken) =>
        set((state) => ({
          accessToken: accessToken ?? '',
          member: state.member,
        })),
      setMember: (member) => set({ member }),
      clearAuth: () => set(initialState),
      login: async ({ username, password }) => {
        const payload = { username, password }

        try {
          const response = await authAxios.post('/auth/login', payload)
          const data = response.data
          const accessToken = data?.accessToken

          if (!accessToken) {
            throw new Error('로그인은 성공했지만 access token을 받지 못했습니다.')
          }

          set({
            accessToken,
            member: data?.member ?? data?.admin ?? null,
          })

          return data
        } catch (error) {
          const message =
            error?.response?.data?.errorMessage ??
            '로그인에 실패했습니다. 아이디와 비밀번호를 다시 확인해주세요.'

          throw new Error(message)
        }
      },
      logout: async () => {
        try {
          const accessToken = get().accessToken
          const headers = accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined

          await authAxios.post('/auth/logout', null, { headers })
          set(initialState)
        } catch (error) {
          const message =
            error?.response?.data?.errorMessage ??
            '로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.'

          throw new Error(message)
        }
      },
    }),
    {
      name: 'studio-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ accessToken, member }) => ({ accessToken, member }),
    },
  ),
)

export const selectIsAuthenticated = (state) => Boolean(state.accessToken)

export default useAuthStore
