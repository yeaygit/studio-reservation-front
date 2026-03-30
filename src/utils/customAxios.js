import axios from 'axios'
import useAuthStore from '../store/useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const customAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const refreshAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

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

    if (
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/logout')
    ) {
      return Promise.reject(error)
    }

    if (originalRequest?.retry || error.response.status !== 401) {
      return Promise.reject(error)
    }

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
      const refreshResponse = await refreshAxios.post('/auth/refresh')
      const newAccessToken = refreshResponse.data?.accessToken

      if (!newAccessToken) {
        throw new Error('Access token was not returned from refresh API.')
      }

      useAuthStore.getState().setAccessToken(newAccessToken)
      processQueue(null, newAccessToken)

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return customAxios(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default customAxios
