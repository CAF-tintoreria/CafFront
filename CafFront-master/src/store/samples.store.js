// src/store/samples.store.js
import { create } from "zustand";
import { MuestrasService } from "@/services/samples.service";

export const useSamplesStore = create((set, get) => ({
  samples: [],
  statuses: [], // 👈
  isLoading: false,
  error: null,

  fetchSamples: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await MuestrasService.list();
      set({ samples: data ?? [] });
    } catch (e) {
      set({ error: e.message || "Error al listar muestras" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStatuses: async () => {
    try {
      const list = await MuestrasService.listStatuses();
      set({ statuses: list || [] });
    } catch (err) {
      console.error(err);
    }
  },

  addSample: async (dto) => {
    set({ isLoading: true });
    try {
      const { message } = await MuestrasService.create(dto);
      return message || "Muestra creada correctamente.";
    } finally {
      set({ isLoading: false });
    }
  },

  updateSample: async (id, dto) => {
    set({ isLoading: true });
    try {
      const { message } = await MuestrasService.update(id, dto);
      return message || "Muestra actualizada correctamente.";
    } finally {
      set({ isLoading: false });
    }
  },

  // 👇 cambiar estado
  updateEstado: async (id, estadoId) => {
    const { message } = await MuestrasService.updateEstado(id, estadoId);
    return message;
  },

  // 👇 eliminar
  deleteSample: async (id) => {
    const { message } = await MuestrasService.remove(id);
    await get().fetchSamples();
    return message;
  },

  async getById(id) {
    const local = get().samples.find(
      (m) => Number(m.muestraID ?? m.id) === Number(id)
    );
    if (local) return local;
    const { data } = await MuestrasService.getById(id);
    return data;
  },
}));
