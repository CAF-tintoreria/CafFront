import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortButton } from "./components/SortButton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Edit } from "lucide-react";

export function ProcessDesktopTable({
  process,
  canEdit,
  canDelete,
  onDelete,
  showEditDialog,
}) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="id">ID</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="proceso">Tipo de proceso</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="observacion">Observaciones</SortButton>
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {process.map((processItem) => (
            <TableRow key={processItem.id}>
              <TableCell className="font-medium">#{processItem.id}</TableCell>
              <TableCell>{processItem.proceso}</TableCell>
              <TableCell>{processItem.observacion}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Editar proceso"
                      onClick={() => showEditDialog(processItem)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(processItem)}
                      title="Eliminar proceso"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
