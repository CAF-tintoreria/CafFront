// src/services/samples.service.js
import { api } from "@/lib/axios";

export const MuestrasService = {
  async list() {
    const { data } = await api.get("/Sample");
    if (data?.ok === false)
      throw new Error(data?.message || "No se pudieron listar muestras.");
    return { data: data?.data ?? [] };
  },

  async getById(id) {
    const { data } = await api.get(`/Sample/${id}`);
    if (data?.ok === false)
      throw new Error(data?.message || "No se pudo obtener la muestra.");
    return { data: data?.data ?? null };
  },

  async create(dto) {
    const { data } = await api.post("/Sample/create", dto);
    if (data?.ok === false)
      throw new Error(data?.message || "No se pudo crear la muestra.");
    return { message: data?.message || "Muestra creada correctamente." };
  },

  async update(id, dto) {
    const { data } = await api.put(`/Sample/${id}`, dto);
    if (data?.ok === false)
      throw new Error(data?.message || "No se pudo actualizar la muestra.");
    return { message: data?.message || "Muestra actualizada correctamente." };
  },

  // 👇 NUEVOS
  async remove(id) {
    const { data } = await api.delete(`/Sample/${id}`);
    if (data?.ok === false)
      throw new Error(data?.message || "No se pudo eliminar la muestra.");
    return { message: data?.message || "Muestra eliminada." };
  },

  async listStatuses() {
    // GET /api/SampleStatus -> [{ sampleStatusID, statusName }]
    const { data } = await api.get("/SampleStatus");
    return data ?? [];
  },

  async updateEstado(id, estadoId) {
    // PATCH /api/Sample/{id}/estado/{estadoId}
    const { data } = await api.patch(`/Sample/${id}/estado/${estadoId}`);
    if (data?.ok === false)
      throw new Error(data?.message || "No se pudo actualizar el estado.");
    return { message: data?.message || "Estado actualizado." };
  },
};
