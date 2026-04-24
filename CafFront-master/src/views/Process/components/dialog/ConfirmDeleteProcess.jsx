import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDeleteProcess({
  showDialog,
  onOpenChange,
  confirmDeleteProcess,
  processSelected,
  deleting,
}) {
  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogDescription>
            ¿Eliminar el proceso "{processSelected?.proceso}"? Esta acción no se
            puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => confirmDeleteProcess(processSelected.id)}
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Eliminar proceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
