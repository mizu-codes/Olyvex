import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import type { AppDispatch, RootState } from "../app/store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

type Store = {
  getState: () => RootState;
  dispatch: AppDispatch;
};

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let initialized = false;

let userRefresh: Promise<string> | null = null;
let adminRefresh: Promise<string> | null = null;

function getSessionType(url?: string): "user" | "admin" | null {
  if (!url) return null;

  if (url.includes("/api/admin/")) return "admin";
  if (url.includes("/api/auth/")) return "user";

  return null;
}

function isRefreshOrAuthRequest(url?: string) {
  return (
    url?.endsWith("/login") ||
    url?.endsWith("/register") ||
    url?.endsWith("/refresh") ||
    url?.endsWith("/logout")
  );
}

function setTokenHeader(config: InternalAxiosRequestConfig, token: string) {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  config.headers.set("Authorization", `Bearer ${token}`);
}

export function setupApiInterceptors(store: Store) {
  if (initialized) return;
  initialized = true;

  // Request interceptor
  api.interceptors.request.use((config) => {
    const sessionType = getSessionType(config.url);

    if (!sessionType || isRefreshOrAuthRequest(config.url)) {
      return config;
    }

    const state = store.getState();

    const token =
      sessionType === "user" ? state.auth.token : state.adminAuth.token;

    if (token) {
      setTokenHeader(config, token);
    }

    return config;
  });

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,

    async (error) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as RetryConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      const sessionType = getSessionType(originalRequest.url);

      if (!sessionType || isRefreshOrAuthRequest(originalRequest.url)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        let newToken: string;

        if (sessionType === "user") {
          if (!userRefresh) {
            userRefresh = api
              .post<{ token: string }>("/api/auth/refresh")
              .then((response) => {
                const token = response.data.token;

                store.dispatch({
                  type: "auth/setToken",
                  payload: token,
                });

                return token;
              })
              .finally(() => {
                userRefresh = null;
              });
          }

          newToken = await userRefresh;
        } else {
          if (!adminRefresh) {
            adminRefresh = api
              .post<{ token: string }>("/api/admin/refresh")
              .then((response) => {
                const token = response.data.token;

                store.dispatch({
                  type: "adminAuth/setToken",
                  payload: token,
                });

                return token;
              })
              .finally(() => {
                adminRefresh = null;
              });
          }

          newToken = await adminRefresh;
        }

        setTokenHeader(originalRequest, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        if (sessionType === "user") {
          store.dispatch({
            type: "auth/logout",
          });
        } else {
          store.dispatch({
            type: "adminAuth/logoutAdmin",
          });
        }

        return Promise.reject(refreshError);
      }
    },
  );
}
