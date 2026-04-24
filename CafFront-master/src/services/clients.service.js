// services/clients.service.ts o .js
import { api } from "@/lib/axios";

const unwrap = (res) => {
  const { ok, data, message } = res.data ?? {};
  if (ok === false) throw new Error(message || "Operación no realizada");
  return { data, message }; // puede venir data = undefined en create/update
};

export const ClientesService = {
  async list(username) {
    const res = await api.get("/clients", {
      // el backend espera ?username=..., no ?nombre=...
      params: username ? { username } : undefined,
    });
    return unwrap(res);
  },

  async create(dto) {
    const res = await api.post("/clients", dto);
    return unwrap(res); // NO uses generics aquí
  },

  async getById(id) {
    const res = await api.get(`/clients/${id}`);
    return unwrap(res);
  },

  async update(id, dto) {
    const res = await api.put(`/clients/${id}`, dto);
    return unwrap(res);
  },

  async remove(id) {
    const res = await api.delete(`/clients/${id}`);
    const { ok, message, data } = res?.data ?? {};
    if (ok === false) throw new Error(message || "No se pudo eliminar.");
    return { data, message };
  },
};
