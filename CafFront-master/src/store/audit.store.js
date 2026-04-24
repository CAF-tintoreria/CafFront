import { create } from "zustand";
import { AuditService } from "@/services/audit.service";

export const useAuditStore = create((set) => ({
  rows: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  async fetchAudit(params) {
    set({ isLoading: true, error: null });
    try {
      const { data, total, page, pageSize } = await AuditService.list(params);
      set({
        rows: data ?? [],
        total,
        page: page ?? 1,
        pageSize: pageSize ?? 20,
      });
    } catch (e) {
      set({ error: e?.message || "Error al obtener auditoría" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
