import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { showToast } from "@/lib/Toast";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useSamplesStore } from "@/store/samples.store";
import { useClientsStore } from "@/store/client.store";

const requiredSelect = (label) =>
  z
    .any()
    .transform((v) => (v === "" || v == null ? NaN : Number(v)))
    .refine((n) => Number.isFinite(n) && n > 0, {
      message: `Selecciona ${label}`,
    });

const schemaFactory = () =>
  z.object({
    clotheType: z
      .string()
      .trim()
      .min(1, "Requerido")
      .max(32, "Máx 32 caracteres"),
    kilogramWeight: z.coerce
      .number({
        invalid_type_error: "Valor numérico",
      })
      .positive("Debe ser mayor a 0"),
    sampleStatusID: requiredSelect("el estado"),
    clientID: requiredSelect("el cliente"),
    observaciones: z.string().max(500, "Máx 500 caracteres").optional(),
  });

export default function CreateSample() {
  const navigate = useNavigate();

  const { addSample, samples, statuses, fetchStatuses } = useSamplesStore();
  const { clients, fetchClients } = useClientsStore();

  const [openClienteCombo, setOpenClienteCombo] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const existingNames = useMemo(
    () =>
      new Set(
        (samples ?? [])
          .map((m) =>
            String(m.clotheType ?? m.tipoPrenda ?? "")
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ),
    [samples]
  );

  useEffect(() => {
    (async () => {
      setLoadingLookups(true);
      try {
        await Promise.all([fetchStatuses?.(), fetchClients?.()]);
      } catch (err) {
        showToast({
          title: err?.message || "Error cargando catálogos",
          icon: "error",
        });
      } finally {
        setLoadingLookups(false);
      }
    })();
  }, [fetchStatuses, fetchClients]);

  const schema = useMemo(() => schemaFactory(), []);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      clotheType: "",
      kilogramWeight: "",
      sampleStatusID: "",
      clientID: "",
      observaciones: "",
    },
  });

  const estadosOptions = useMemo(
    () =>
      (statuses ?? []).map((s) => ({
        id: s.sampleStatusID,
        nombre: s.statusName,
      })),
    [statuses]
  );

  const onSubmit = async (values) => {
    try {
      const dto = {
        clotheType: values.clotheType.trim(),
        kilogramWeight: values.kilogramWeight,
        clientID: values.clientID,
        sampleStatusID: values.sampleStatusID,
        modifiedAt: new Date().toISOString(),
        observaciones: values.observaciones || null,
      };

      const msg = await addSample(dto);
      showToast({ title: msg || "Muestra registrada correctamente" });
      navigate({ to: "/muestras", replace: true });
    } catch (err) {
      showToast({
        title: err?.message || "Hubo un problema al registrar la muestra",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <NavigateRoute path="/muestras" />
          <CardTitle>Alta de Muestra</CardTitle>
          <CardDescription>
            Completa los datos para registrar una nueva muestra
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Información Básica (paralela a prendas) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clotheType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Prenda *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Remera muestra" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kilogramWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso (Kg) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sampleStatusID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de la Muestra *</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString() ?? ""}
                            onValueChange={field.onChange}
                            disabled={loadingLookups || !estadosOptions.length}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingLookups
                                    ? "Cargando..."
                                    : "Selecciona el estado"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {estadosOptions.map((e) => (
                                <SelectItem key={e.id} value={String(e.id)}>
                                  {e.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cliente (combobox como en prendas) */}
                  <FormField
                    control={form.control}
                    name="clientID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente *</FormLabel>
                        <FormControl>
                          <Popover
                            open={openClienteCombo}
                            onOpenChange={setOpenClienteCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={openClienteCombo}
                                className="w-full justify-between bg-transparent"
                                disabled={
                                  loadingLookups || !(clients ?? []).length
                                }
                              >
                                {(() => {
                                  if (loadingLookups)
                                    return "Cargando clientes...";
                                  const c = (clients ?? []).find(
                                    (cl) =>
                                      String(cl.clientID) ===
                                      String(field.value)
                                  );
                                  return c
                                    ? `${c.username} - ${c.contact ?? ""}`
                                    : "Buscar cliente...";
                                })()}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Buscar cliente..." />
                                <CommandList>
                                  <CommandEmpty>
                                    No se encontraron clientes.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {(clients ?? []).map((c) => (
                                      <CommandItem
                                        key={c.clientID}
                                        value={`${c.username} ${
                                          c.contact ?? ""
                                        }`}
                                        onSelect={() => {
                                          field.onChange(String(c.clientID));
                                          setOpenClienteCombo(false);
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {c.username}
                                          </span>
                                          <span className="text-sm text-gray-500">
                                            {c.contact ?? ""}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
                          {/* Observaciones */}
                          <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Observaciones</h3>
                              <FormField
                                  control={form.control}
                                  name="observaciones"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Observaciones</FormLabel>
                                          <FormControl>
                                              <textarea
                                                  className="w-full border rounded-md p-2 text-sm min-h-[100px]"
                                                  placeholder="Ingresar observaciones (opcional)"
                                                  {...field}
                                              />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                          </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Registrando..."
                  : "Registrar Muestra"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
