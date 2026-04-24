import { useMemo } from "react";
import { useSortStore } from "../store/useSortStore";

export function useNormalizedProcess(process, searchTerm) {
  const sortDirection = useSortStore((state) => state.sortDirection);
  const sortField = useSortStore((state) => state.sortField);

  const normalizedProcess = useMemo(
    () =>
      (process || []).map((processItem) => ({
        id: processItem.processID,
        proceso: processItem.typeProcess,
        observacion: (processItem.observations || "").toLowerCase(),
      })),
    [process]
  );

  const filteredAndSortedProcess = useMemo(() => {
    const filtered = normalizedProcess.filter((process) => {
      const matchesSearch =
        !searchTerm ||
        process.proceso.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField],
        bValue = b[sortField];
      if (typeof aValue === "string" && typeof bValue === "string")
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      if (typeof aValue === "number" && typeof bValue === "number")
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      return 0;
    });

    return filtered;
  }, [normalizedProcess, searchTerm, sortField, sortDirection]);

  return {
    filteredAndSortedProcess,
  };
}
