import { api } from "@/lib/axios";

const USERS_PATH = `${import.meta.env.VITE_API_URL}/users`;

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Error desconocido";

export const UsersService = {
  /** GET /users -> retorna array de usuarios */
  async list() {
    try {
      const res = await api.get(USERS_PATH);
      const { ok, message, data } = res?.data ?? {};
      if (ok === false) throw new Error(message || "");
      return data ?? [];
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  /** POST /users -> { username, role, password }  */
  async create({ username, role, password }) {
    try {
      const res = await api.post(USERS_PATH, { username, role, password });
      const { ok, message, data } = res?.data ?? {};
      if (ok === false) throw new Error(message || "");
      return { data, message };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  /** PUT /users/:id -> { username, role } */
  async update(id, { username, role }) {
    try {
      const res = await api.put(`${USERS_PATH}/${id}`, { username, role });
      const { ok, message, data } = res?.data ?? {};
      if (ok === false) throw new Error(message || "");
      return { data, message };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  /** GET /users/:id (si no existe, fallback a buscar en el listado) */
  async getById(id) {
    try {
      const res = await api.get(`${USERS_PATH}/${id}`);
      const { ok, message, data } = res?.data ?? {};
      if (ok === false) throw new Error(message || "");
      return { data, message };
    } catch (err) {
      try {
        const list = await UsersService.list();
        const found = list.find((u) => u.userId === Number(id)) || null;
        if (!found) throw err;
        return { data: found, message: "Encontrado en caché local." };
      } catch {
        throw new Error(getErrorMessage(err));
      }
    }
  },

  async remove(id) {
    try {
      const res = await api.delete(`${USERS_PATH}/${id}`);
      const { ok, message, data } = res?.data ?? {};
      if (ok === false) throw new Error(message || "");
      return { data, message }; // message viene del backend
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  /** POST /users/change-password -> { username, role, newPassword } */
  async changePassword({ username, role, newPassword }) {
    try {
      const res = await api.post(`${USERS_PATH}/change-password`, {
        username,
        role,
        newPassword,
      });
      const { ok, message, data } = res?.data ?? {};
      if (ok === false) throw new Error(message || "");
      return { data, message };
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },
};
