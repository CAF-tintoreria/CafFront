import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

export const ConfirmCancelDialog = ({ open, onAcceptCancel, onClose }) => {
  const onConfirm = () => {
    onAcceptCancel();
    onClose();
  };
  return (
    <Dialog open={open}>
      <DialogPortal>
        <DialogOverlay>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Estás seguro de cancelar?</DialogTitle>
              <DialogDescription>
                Existen cambios pendientes en la edición de formulario. Se
                perderán en caso de cancelar el proceso.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={onConfirm}
                className={"bg-red-600 hover:bg-red-500"}
              >
                {" "}
                Confirmar{" "}
              </Button>

              <Button onClick={onClose}>Cancelar</Button>
            </DialogFooter>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
};
