import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:4000";
export const API_BASE_URL = API_URL;

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn;
}

let getAccessToken: (() => string | null) | null = null;
let getRefreshToken: (() => string | null) | null = null;
let setTokens: ((a: string, r: string) => void) | null = null;

export function configureTokens(opts: {
  getAccess: () => string | null;
  getRefresh: () => string | null;
  set: (a: string, r: string) => void;
}): void {
  getAccessToken = opts.getAccess;
  getRefreshToken = opts.getRefresh;
  setTokens = opts.set;
}

export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  timeout: 20_000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;
async function tryRefresh(): Promise<string | null> {
  const refresh = getRefreshToken?.();
  if (!refresh) return null;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/refresh`,
        { refreshToken: refresh },
        { withCredentials: true }
      );
      setTokens?.(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original: any = error.config;
    if (error.response?.status === 401 && !original?._retried) {
      original._retried = true;
      const newAccess = await tryRefresh();
      if (newAccess) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api.request(original);
      }
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export interface ApiUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  theme: string;
  currentMood?: string | null;
  spotifyConnected?: boolean;
  status?: { status: string; customStatus?: string | null } | null;
  digitalRoom?: { id: string; theme: string } | null;
}
