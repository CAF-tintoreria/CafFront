// src/views/Samples/EditSample.jsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { showToast } from "@/lib/Toast";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { useClientsStore } from "@/store/client.store";
import { useSamplesStore } from "@/store/samples.store";
import { ConfirmCancelDialog } from "./components/ConfirmCancelDialog";
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
      .number({ invalid_type_error: "Valor numérico" })
      .positive("Debe ser mayor a 0"),
    sampleStatusID: requiredSelect("el estado"),
    clientID: requiredSelect("el cliente"),
    observaciones: z.string().max(500, "Máx 500 caracteres").optional(),
  });

export default function EditSample() {
  const navigate = useNavigate();
  const { sampleId } = useParams({ strict: false }); // viene de /muestras/$sampleId/editar
  const id = Number(sampleId);
  const [open, setOpen] = useState(false);

  const onOpenHandle = (isDirty) => {
    if (isDirty) {
      setOpen(true);
    } else {
      navigate({ to: "/muestras", replace: true });
    }
  };

  const onCloseHandle = () => setOpen(false);

  const {
    samples,
    fetchSamples,
    getById,
    statuses,
    fetchStatuses,
    updateSample,
  } = useSamplesStore();
  const { clients, fetchClients } = useClientsStore();

  const [loadingLookups, setLoadingLookups] = useState(true);
  const [loadingSample, setLoadingSample] = useState(true);
  const [openClienteCombo, setOpenClienteCombo] = useState(false);

  // nombres existentes para validar duplicado (excluyendo la propia muestra)
  const existingNames = useMemo(() => {
    return new Set(
      (samples ?? [])
        .filter((s) => Number(s.muestraID ?? s.id) !== id)
        .map((m) =>
          String(m.clotheType ?? m.tipoPrenda ?? "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    );
  }, [samples, id]);

  // form
  const schema = useMemo(() => schemaFactory(), []);
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: schema,
  });

  // cargar catálogos
  useEffect(() => {
    (async () => {
      setLoadingLookups(true);
      try {
        await Promise.all([
          fetchStatuses?.(),
          fetchClients?.(),
          fetchSamples?.(),
        ]);
      } catch (err) {
        showToast({
          title: err?.message || "Error cargando catálogos",
          icon: "error",
        });
      } finally {
        setLoadingLookups(false);
      }
    })();
  }, [fetchStatuses, fetchClients, fetchSamples]);

  // cargar la muestra y precargar form
  useEffect(() => {
    (async () => {
      setLoadingSample(true);
      try {
        const data = await getById(id);
        if (!data) throw new Error("Muestra no encontrada.");

        form.reset({
          clotheType: data.clotheType ?? data.tipoPrenda ?? "",
          kilogramWeight: data.kilogramWeight ?? data.pesoKilos ?? "",
          sampleStatusID:
            data.status?.sampleStatusID ?? data.sampleStatusID ?? "",
          clientID: data.client?.clientID ?? data.clienteID ?? "",
          observaciones: data.observaciones ?? "",
        });
      } catch (err) {
        showToast({
          title: err?.message || "No se pudo cargar la muestra",
          icon: "error",
        });
        navigate({ to: "/muestras", replace: true });
      } finally {
        setLoadingSample(false);
      }
    })();
  }, [id, getById, form, navigate]);

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

      const msg = await updateSample(id, dto);
      showToast({ title: msg || "Muestra actualizada correctamente" });
      navigate({ to: "/muestras", replace: true });
    } catch (err) {
      showToast({
        title: err?.message || "Hubo un problema al actualizar la muestra",
        icon: "error",
      });
    }
  };

  if (loadingSample) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center text-muted-foreground">
            Cargando muestra...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <NavigateRoute path="/muestras" />
          <CardTitle>Editar Muestra</CardTitle>
          <CardDescription>
            Modifica los datos de la muestra #{id}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Información Básica */}
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

              {/* Estado y Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estado y Cliente</h3>
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
                                className="w-full justify-between bg-transparent "
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
                                  return c ? (
                                    <span
                                      title={`${c.username} - ${
                                        c.contact ?? ""
                                      }`}
                                      className="w-fit text-ellipsis max-w-[80%] overflow-hidden"
                                    >
                                      {c.username} - {c.contact ?? ""}
                                    </span>
                                  ) : (
                                    "Buscar cliente..."
                                  );
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

            <CardFooter className="gap-3">
              <Button
                onClick={() => onOpenHandle(form.formState.isDirty)}
                type="button"
                variant="outline"
                className="bg-transparent cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                className={"cursor-pointer"}
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <ConfirmCancelDialog
        open={open}
        onAcceptCancel={() => navigate({ to: "/muestras", replace: true })}
        onClose={onCloseHandle}
      />
    </div>
  );
}
