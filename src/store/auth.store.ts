import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, ApiUser, configureTokens, setUnauthorizedHandler } from "../services/api";

interface AuthState {
  user: ApiUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  hydrated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: { email: string; username: string; displayName: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setTokens: (a: string, r: string) => void;
  setUser: (u: ApiUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      hydrated: false,

      setTokens: (a, r) => set({ accessToken: a, refreshToken: r }),
      setUser: (u) => set({ user: u }),

      login: async (identifier, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post("/auth/login", { identifier, password });
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } finally {
          set({ loading: false });
        }
      },

      register: async (input) => {
        set({ loading: true });
        try {
          const { data } = await api.post("/auth/register", input);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        const refreshToken = get().refreshToken;
        try {
          await api.post("/auth/logout", { refreshToken });
        } catch {
          /* ignore */
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.user });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },
    }),
    {
      name: "2347-auth",
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
      onRehydrateStorage: () => (state) => {
        // Marca hydrated tras rehidratación
        useAuthStore.setState({ hydrated: true });
      },
    }
  )
);

// Configurar tokens de API al boot
configureTokens({
  getAccess: () => useAuthStore.getState().accessToken,
  getRefresh: () => useAuthStore.getState().refreshToken,
  set: (a, r) => useAuthStore.getState().setTokens(a, r),
});

setUnauthorizedHandler(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
});
