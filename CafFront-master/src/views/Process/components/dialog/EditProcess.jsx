import ContainerFormField from "@/components/form/ContainerFormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { processSchema } from "../../constants/schema";
import { useEditProcess } from "../../hooks/useEditProcess";

export function EditProcess({ process, showDialog, onOpenChange, refetch }) {
  const form = useForm({
    resolver: zodResolver(processSchema),
    defaultValues: {
      observations: process?.observacion,
      typeProcess: process?.proceso,
    },
  });

  const { editProcess, loading } = useEditProcess();

  const onSubmit = async (formValues) => {
    const sanitizeForm = {
      typeProcess: formValues.typeProcess.trimEnd(),
      observations: formValues.observations.trimEnd(),
    };

    try {
      const response = await editProcess(process.id, sanitizeForm);
      if (response.ok) {
        showToast({
          title: "Edición éxitosa",
        });
        onOpenChange(false);
        refetch();
      }
    } catch (error) {
      showToast({
        title: "Ocurrió un error en la edición" + error,
        icon: "error",
      });
    }
  };
  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edición de proceso #{process.id}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="typeProcess"
              render={({ field }) => (
                <ContainerFormField label={"Tipo de proceso"}>
                  <Input {...field} />
                </ContainerFormField>
              )}
            />
            <FormField
              name="observations"
              render={({ field }) => (
                <ContainerFormField label={"Observación"}>
                  <Input {...field} />
                </ContainerFormField>
              )}
            />
            <footer className="flex w-full justify-around">
              <Button
                className={"w-1/3"}
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                className={"w-1/3"}
                type="submit"
                disabled={!form.formState.isDirty}
              >
                {loading ? "Editando..." : "Editar proceso"}
              </Button>
            </footer>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
