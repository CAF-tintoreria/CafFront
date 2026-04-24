import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectFilter({
  filterValue,
  onChangeFilterValue,
  listOptions,
}) {
  const capitalizeFirstLetter = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  return (
    <>
      <Select value={filterValue} onValueChange={onChangeFilterValue}>
        <SelectTrigger>
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {listOptions.map((r) => (
            <SelectItem key={r} value={r}>
              {capitalizeFirstLetter(r)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
