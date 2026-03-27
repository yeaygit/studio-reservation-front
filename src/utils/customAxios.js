import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

const customAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

customAxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("Access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

customAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    if (originalRequest?.retry || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return customAxios(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest.retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await refreshAxios.post("/auth/refresh");

      const newAccessToken = refreshResponse.data.accessToken;
      sessionStorage.setItem("Access", newAccessToken);

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return customAxios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      sessionStorage.removeItem("Access");
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default customAxios;
