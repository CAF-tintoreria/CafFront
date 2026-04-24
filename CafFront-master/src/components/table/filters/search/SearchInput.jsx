import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchInput({ searchValue, onSearch, placeholder }) {
  return (
    <>
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        id="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-8"
      />
    </>
  );
}
