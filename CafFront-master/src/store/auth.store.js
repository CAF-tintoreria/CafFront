import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService } from "@/services/auth.service";
import { api } from "@/lib/axios";

const decodeJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const isExpired = (payload) => {
  if (!payload?.exp) return false;
  return payload.exp * 1000 < Date.now();
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      rol: null,
      permisos: [],
      hasPermission: (name) => {
        const perms = get().permisos ?? [];
        return perms.includes(name);
      },

      hydrateAuth: () => {
        const token = get().token;
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        if (!get().user) set({ user: decodeJwt(token) });
      },

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, rol, permisos } = await AuthService.login({
            username,
            password,
          });
          const user = decodeJwt(token);
          localStorage.setItem("token", token);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;

          set({
            token,
            user,
            rol,
            permisos: permisos,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (e) {
          set({ isLoading: false, error: e.message });
          throw e;
        }
      },

      logout: () => {
        AuthService.logout();
        delete api.defaults.headers.common.Authorization;
        set({ token: null, user: null, rol: null, permisos: [], error: null });
      },

      isAuthenticated: () => {
        const { token, user } = get();
        return Boolean(token) && !isExpired(user);
      },

      getRole: () => {
        return get().rol;
      },
      getName: () => {
        const u = get().user || {};
        return u.unique_name || u.name || null;
      },
      getUserId: () => {
        const u = get().user || {};
        return u.sub || null;
      },
      getPermissions: () => get().permisos || [],
    }),
    { name: "auth" }
  )
);
