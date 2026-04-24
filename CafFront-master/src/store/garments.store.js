// src/store/garments.store.js
import { create } from "zustand";
import { PrendasService } from "@/services/garments.service";

export const useGarmentsStore = create((set, get) => ({
  garments: [],
  estados: [], // catálogos opcionales
  procesos: [], //
  isLoading: false,
  error: null,

  // ---- Listado ----
  fetchGarments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await PrendasService.list({ full: true });
      set({ garments: data ?? [] });
    } catch (e) {
      set({ error: e.message || "Error al listar prendas" });
    } finally {
      set({ isLoading: false });
    }
  },

  // ---- Catálogos (opcional si los vas a usar en selects) ----
  hydrateLookups: async () => {
    try {
      const [e, p] = await Promise.allSettled([
        PrendasService.listEstados(),
        PrendasService.listProcesos(),
      ]);
      if (e.status === "fulfilled") set({ estados: e.value.data ?? [] });
      if (p.status === "fulfilled") set({ procesos: p.value.data ?? [] });
    } catch {
      // sin bloquear la pantalla
    }
  },

  // ---- Crear ----
  addGarment: async (dto) => {
    set({ isLoading: true });
    try {
      const { message } = await PrendasService.create(dto);
      return message || "Prenda creada correctamente.";
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  // ---- Editar ----
  updateGarment: async (id, dto) => {
    set({ isLoading: true });
    try {
      const { message } = await PrendasService.update(id, dto);
      return message || "Prenda actualizada correctamente.";
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  // ---- Eliminar ----
  removeGarment: async (id) => {
    set({ isLoading: true });
    try {
      const { message } = await PrendasService.remove(id);
      set({
        garments: get().garments.filter((g) => g.prendaID !== Number(id)),
      });
      return message;
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  // ---- Estado ----
  updateEstadoGarment: async (id, estadoPrendaID) => {
    set({ isLoading: true });
    try {
      const { message } = await PrendasService.updateEstado(id, estadoPrendaID);
      await get().fetchGarments(); // refresco
      return message || "Estado actualizado.";
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  // ---- Helpers ----
  async getById(id) {
    // intenta usar el cache primero
    const local = get().garments.find((g) => g.prendaID === Number(id));
    if (local) return local;
    const { data } = await PrendasService.getById(id);
    return data;
  },
}));
