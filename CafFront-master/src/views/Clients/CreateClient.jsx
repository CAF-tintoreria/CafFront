import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { useNavigate } from "@tanstack/react-router";
import { useClientsStore } from "@/store/client.store";
import { showToast } from "@/lib/Toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
    .max(50, "El contacto debe ser menor a 50 caracteres")
    .optional(),
  status: z.enum([STATUS.ACTIVE, STATUS.INACTIVE]),
});

export default function CreateClient() {
  const navigate = useNavigate();
  const { addClient } = useClientsStore.getState();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact: "",
      status: STATUS.ACTIVE,
    },
  });

  const onSubmit = async (values) => {
    try {
      const payload = {
        username: values.name.trim(),
        contact: values.contact?.trim() ? values.contact.trim() : null,
        state: values.status === STATUS.ACTIVE,
      };

      const msg = await addClient(payload);
      showToast({ title: msg || "Cliente creado correctamente" });
      navigate({ to: "/clientes", replace: true });
    } catch (err) {
      showToast({
        title: err.message || "Error al crear cliente",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <NavigateRoute path="/clientes" />
            <div>
              <CardTitle>Crear Cliente</CardTitle>
              <CardDescription>
                Agrega un nuevo cliente al sistema
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

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Registrando..."
                  : "Registrar Cliente"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
