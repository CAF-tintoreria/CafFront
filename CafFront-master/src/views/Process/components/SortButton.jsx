import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useSortStore } from "../store/useSortStore";

export function SortButton({ field, children }) {
  const sortDirection = useSortStore((state) => state.sortDirection);
  const sortField = useSortStore((state) => state.sortField);
  const setSortDirection = useSortStore((state) => state.setSortDirection);
  const setSortField = useSortStore((state) => state.setSortField);

  const handleSort = (field) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 p-0 font-semibold hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
