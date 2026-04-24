import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Edit } from "lucide-react";

export function ProcessMobileTable({
  process,
  canEdit,
  canDelete,
  onDelete,
  showEditDialog,
}) {
  return (
    <div className="space-y-4">
      {process.map((processItem) => (
        <Card key={processItem.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {processItem.proceso}
                </h3>
                <p className="text-sm text-gray-500">ID #{processItem.id}</p>
              </div>
            </div>
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
                  title="Eliminar usuario"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
