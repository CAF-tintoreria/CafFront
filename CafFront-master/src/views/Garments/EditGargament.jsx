// src/views/Garments/EditGargament.jsx
import { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Search,
  ArrowLeft,
  Save,
} from "lucide-react";
import { format, endOfDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Link, useNavigate } from "@tanstack/react-router";
import { showToast } from "@/lib/Toast";
import { useGarmentsStore } from "@/store/garments.store";
import { useSamplesStore } from "@/store/samples.store";
import { ClientesService } from "@/services/clients.service";
import { api } from "@/lib/axios";

// === react-hook-form + zod (mismas validaciones que en Crear) ===
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

// --------- helpers/validaciones idénticos a Crear ----------
const requiredSelect = (label) =>
  z
    .any()
    .transform((v) => (v === "" || v == null ? NaN : Number(v)))
    .refine((n) => Number.isFinite(n) && n > 0, {
      message: `Selecciona ${label}`,
    });

const numberOrDefaultOne = z
  .union([z.literal(""), z.coerce.number().int().positive()])
  .transform((v) => (v === "" ? 1 : v));

const fechaSchema = z
  .any()
  .refine((v) => v == null || v instanceof Date, {
    message: "Selecciona una fecha",
  })
  .refine((v) => v == null || v <= endOfDay(new Date()), {
    message: "No puede ser futura",
  })
  .transform((v) => v ?? null);

const schema = z.object({
  tipoPrenda: z
    .string()
    .trim()
    .min(1, "Requerido")
    .max(32, "Máx 32 caracteres"),
  nroCorte: numberOrDefaultOne,
  cantidadUnidades: numberOrDefaultOne,
  pesoKilos: z.preprocess(
    (v) => (typeof v === "string" ? v.replace(",", ".") : v),
    z.coerce.number({ invalid_type_error: "Valor numérico" })
  ),
  cantidadBolsas: z.coerce.number().int().min(0, "No puede ser negativo"),
  fechaIngreso: fechaSchema.refine((d) => d !== null, {
    message: "Selecciona una fecha",
  }),
  remito: z.string().trim().max(20, "Máx 20 caracteres").optional().nullable(),
  estadoPrendaID: requiredSelect("el estado"),
  procesoID: requiredSelect("el proceso"),
  clienteID: requiredSelect("el cliente"),
  muestraID: z
    .union([z.coerce.number().int(), z.literal(NaN)])
    .optional()
    .transform((v) => (Number.isNaN(v) ? null : v)),
  observaciones: z
    .string()
    .trim()
    .max(500, "Máx 500 caracteres")
    .optional()
    .nullable(),
});

// helpers de muestras (label y value)
const getSampleId = (s) => String(s?.muestraID ?? s?.id ?? "");
const getSampleLabel = (s) => {
  const type = s?.clotheType ?? "Muestra";
  const user = s?.client?.username ?? "Sin cliente";
  return `${type} - ${user}`;
};

export default function EditGargament({ prendaId }) {
  const navigate = useNavigate();
  const { getById, updateGarment } = useGarmentsStore.getState();
  const { samples, fetchSamples } = useSamplesStore();

  // catálogos
  const [clientes, setClientes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // UI
  const [openClienteCombo, setOpenClienteCombo] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [loadingPrenda, setLoadingPrenda] = useState(true);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      tipoPrenda: "",
      nroCorte: "",
      cantidadUnidades: "",
      pesoKilos: "",
      cantidadBolsas: "",
      fechaIngreso: null,
      remito: "",
      estadoPrendaID: "",
      procesoID: "",
      clienteID: "",
      muestraID: NaN,
      observaciones: "",
    },
  });

  // cargar catálogos
  useEffect(() => {
    (async () => {
      setLoadingCatalogs(true);
      try {
        const { data: cli } = await ClientesService.list();
        setClientes(
          (cli || []).map((c) => ({
            id: c.clientID,
            nombre: c.username,
            contacto: c.contact ?? "",
            activo: !!c.state,
          }))
        );

        const r = await api.get("/process/options");
        const { ok: okP, data: dataP, message: messageP } = r.data ?? {};
        if (okP === false)
          throw new Error(messageP || "No se pudieron obtener los procesos.");
        setProcesos(
          (dataP || []).map((p) => ({ id: p.procesoID, nombre: p.nombre }))
        );

        const res = await api.get("/estado-prenda");
        const { ok, data, message } = res.data ?? {};
        if (ok === false)
          throw new Error(message || "No se pudieron obtener los estados.");
        setEstados(
          (data || []).map((e) => ({
            id: e.estadoPrendaID,
            nombre: e.estadoActual,
          }))
        );
      } catch (err) {
        showToast({
          title: err?.message || "Error cargando catálogos",
          icon: "error",
        });
      } finally {
        setLoadingCatalogs(false);
      }
    })();
  }, []);

  // cargar muestras (combo opcional)
  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  // cargar prenda y pre-cargar form
  useEffect(() => {
    (async () => {
      try {
        setLoadingPrenda(true);
        const g = await getById(prendaId);
        if (!g) {
          showToast({ title: "Prenda no encontrada", icon: "error" });
          navigate({ to: "/prendas", replace: true });
          return;
        }

        // Normalizar valores a los tipos del form (como en Crear)
        const muestraId =
          g.muestraID ?? g.muestra?.muestraID ?? g.muestra?.id ?? null;

        form.reset({
          tipoPrenda: g.tipoPrenda ?? "",
          nroCorte: String(g.nroCorte ?? ""),
          cantidadUnidades: String(g.cantidadUnidades ?? ""),
          pesoKilos: String(g.pesoKilos ?? ""),
          cantidadBolsas: String(g.cantidadBolsas ?? ""),
          fechaIngreso: g.fechaIngreso ? new Date(g.fechaIngreso) : null,
          remito: g.remito ?? "",
          estadoPrendaID: String(g.estadoPrendaID ?? ""),
          procesoID: String(g.procesoID ?? ""),
          clienteID: String(g.clienteID ?? ""),
          muestraID: muestraId ?? NaN,
          observaciones: g.observaciones ?? "",
        });
      } catch (err) {
        showToast({
          title: err?.message || "No se pudieron cargar los datos",
          icon: "error",
        });
        navigate({ to: "/prendas", replace: true });
      } finally {
        setLoadingPrenda(false);
      }
    })();
  }, [prendaId, getById, form, navigate]);

  const onSubmit = async (values) => {
    try {
      const dto = {
        tipoPrenda: values.tipoPrenda.trim(),
        nroCorte: values.nroCorte,
        cantidadUnidades: values.cantidadUnidades,
        pesoKilos: values.pesoKilos,
        cantidadBolsas: values.cantidadBolsas,
        fechaIngreso: values.fechaIngreso.toISOString(),
        remito: values.remito?.trim() || null,
        estadoPrendaID: values.estadoPrendaID,
        procesoID: values.procesoID,
        clienteID: values.clienteID,
        muestraID: values.muestraID ?? null,
        observaciones: values.observaciones?.trim() || null,
      };

      const msg = await updateGarment(prendaId, dto);
      showToast({ title: msg || "Prenda actualizada correctamente" });
      navigate({ to: "/prendas", replace: true });
    } catch (err) {
      showToast({
        title: err?.message || "Hubo un problema al actualizar la prenda",
        icon: "error",
      });
    }
  };

  const clienteSeleccionado = useMemo(
    () =>
      clientes.find((cl) => String(cl.id) === String(form.watch("clienteID"))),
    [clientes, form]
  );

  if (loadingPrenda) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" />
              <p className="text-gray-600">Cargando datos de la prenda...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link to="/prendas" className="inline-flex">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle>Editar Prenda</CardTitle>
              <CardDescription>
                Modifica los datos de la prenda #{prendaId}
              </CardDescription>
            </div>
          </div>
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
                    name="tipoPrenda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Prenda *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Remera" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nroCorte"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nro de Corte</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Por defecto se envía 1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Cantidades */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cantidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cantidadUnidades"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad Unidades</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Por defecto se envía 1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pesoKilos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso (Kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cantidadBolsas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad Bolsas</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Fecha y Remito */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fecha y Documentación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fechaIngreso"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Ingreso *</FormLabel>
                        <Popover
                          open={openCalendar}
                          onOpenChange={setOpenCalendar}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "PPP", { locale: es })
                                  : "Selecciona una fecha"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={(date) => {
                                field.onChange(date ?? null);
                                setOpenCalendar(false);
                              }}
                              locale={es}
                              disabled={{ after: endOfDay(new Date()) }}
                              modifiers={{ today: startOfDay(new Date()) }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="remito"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remito (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de remito" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Estado y Proceso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estado y Proceso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estadoPrendaID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de la Prenda *</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString() ?? ""}
                            onValueChange={field.onChange}
                            disabled={loadingCatalogs || !estados.length}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingCatalogs
                                    ? "Cargando..."
                                    : "Selecciona el estado"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {estados.map((e) => (
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
                    name="procesoID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Proceso *</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString() ?? ""}
                            onValueChange={field.onChange}
                            disabled={loadingCatalogs || !procesos.length}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingCatalogs
                                    ? "Cargando..."
                                    : "Selecciona el proceso"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {procesos.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Cliente (buscable) */}
              <FormField
                control={form.control}
                name="clienteID"
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
                            variant="outline"
                            role="combobox"
                            aria-expanded={openClienteCombo}
                            className="w-full justify-between bg-transparent"
                            disabled={loadingCatalogs || !clientes.length}
                          >
                            {(() => {
                              if (loadingCatalogs)
                                return "Cargando clientes...";
                              const c = clientes.find(
                                (cl) => String(cl.id) === String(field.value)
                              );
                              return c
                                ? `${c.nombre} - ${c.contacto}`
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
                                {clientes.map((cliente) => (
                                  <CommandItem
                                    key={cliente.id}
                                    value={`${cliente.nombre} ${cliente.contacto}`}
                                    onSelect={() => {
                                      field.onChange(String(cliente.id));
                                      setOpenClienteCombo(false);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {cliente.nombre}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {cliente.contacto}
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

              {/* Muestra (opcional) */}
              <FormField
                control={form.control}
                name="muestraID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Muestra (opcional)</FormLabel>
                    <FormControl>
                      <Select
                        value={
                          Number.isNaN(field.value)
                            ? "__none"
                            : String(field.value)
                        }
                        onValueChange={(val) =>
                          field.onChange(val === "__none" ? NaN : Number(val))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sin muestra" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">Sin muestra</SelectItem>
                          {(samples ?? [])
                            .filter(
                              (s) => s && (s.muestraID != null || s.id != null)
                            )
                            .map((s) => {
                              const id = getSampleId(s);
                              const label = getSampleLabel(s);
                              return (
                                <SelectItem key={id} value={id}>
                                  {label}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observaciones */}
              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones de la prenda"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="gap-3">
              <Link to="/prendas" className="inline-flex flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
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
