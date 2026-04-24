import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { Link, useNavigate } from "@tanstack/react-router";
import { useClientsStore } from "@/store/client.store";
import { ClientesService } from "@/services/clients.service";
import { showToast } from "@/lib/Toast";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { STATUS } from "./constants/status";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContainerFormField from "@/components/form/ContainerFormField";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe contener al menos 2 caracteres")
    .max(20, "El nombre debe ser menor a 20 caracteres"),
  contact: z
    .string()
    .trim()
    .min(5, "El contacto debe contener al menos 5 caracteres")
    .max(50, "El contacto debe ser menor a 50 caracteres")
    .optional(),
  status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]),
});

export default function EditClient({ clientId }) {
  const navigate = useNavigate();
  const { updateClient } = useClientsStore.getState();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact: "",
      status: STATUS.ACTIVE,
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ClientesService.getById(clientId);
        if (!data) {
          showToast({ title: "Cliente no encontrado", icon: "warning" });
          navigate({ to: "/clientes", replace: true });
          return;
        }

        form.reset({
          name: data.username ?? "",
          contact: data.contact ?? "",
          status: data.state ? STATUS.ACTIVE : STATUS.INACTIVE,
        });
      } catch (err) {
        showToast({ title: "Error al cargar el cliente", icon: "error" });
        navigate({ to: "/clientes", replace: true });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clientId]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        username: values.name.trim(),
        contact: values.contact?.trim() ? values.contact.trim() : null,
        state: values.status === STATUS.ACTIVE,
      };

      const msg = await updateClient(Number(clientId), payload);
      showToast({ title: msg || "Cliente actualizado correctamente" });
      navigate({ to: "/clientes", replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "No se pudo actualizar el cliente";
      showToast({ title: msg, icon: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"></div>
              <p className="text-gray-600">Cargando datos del cliente...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <NavigateRoute path="/clientes" />
            <div>
              <CardTitle>Editar Cliente</CardTitle>
              <CardDescription>
                Modifica los datos del cliente #{clientId}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <ContainerFormField label="Nombre">
                    <Input id="name" type="text" {...field} />
                  </ContainerFormField>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto</FormLabel>
                    <FormControl>
                      <Input id="contact" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={STATUS.ACTIVE}>Activo</SelectItem>
                          <SelectItem value={STATUS.INACTIVE}>
                            Inactivo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex gap-4">
              <Link to="/clientes" className="inline-flex flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
