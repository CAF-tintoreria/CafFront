// store/client.store.ts
import { create } from "zustand";
import { ClientesService } from "@/services/clients.service";

export const useClientsStore = create((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await ClientesService.list(name);
      set({ clients: data ?? [] });
    } catch (e) {
      set({ error: e.message || "Error al listar clientes" });
    } finally {
      set({ isLoading: false });
    }
  },

  addClient: async (dto) => {
    set({ isLoading: true });
    try {
      const { message } = await ClientesService.create(dto);
      return message || "Cliente creado correctamente.";
    } catch (e) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  updateClient: async (id, dto) => {
    set({ isLoading: true, error: null });
    try {
      const { message } = await ClientesService.update(id, dto);
      return message || "Cliente actualizado correctamente.";
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  removeClient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { message } = await ClientesService.remove(id);
      set({ clients: get().clients.filter((u) => u.clientID !== Number(id)) });
      return message || "Cliente eliminado correctamente.";
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));
