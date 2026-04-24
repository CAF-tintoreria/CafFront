import { create } from "zustand";

export const useSortStore = create((set) => ({
  sortField: "",
  sortDirection: "desc",
  setSortField: (field) => set({ sortField: field }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
}));
