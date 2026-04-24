import { api } from "@/lib/axios";

export const AuthService = {
  async login({ username, password }) {
    const res = await api.post("/auth/login", { username, password });
    const {
      ok,
      token,
      rol,
      permisos,
      username: uname,
      message,
    } = res.data ?? {};
    if (ok === false || !token)
      throw new Error(message || "Credenciales inválidas");
    return { token, rol, permisos: permisos ?? [], username: uname };
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
  },
};
