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
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
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
import { NavigateRoute } from "@/lib/NavigateRoute";
import { showToast } from "@/lib/Toast";
import { useNavigate } from "@tanstack/react-router";
import { useGarmentsStore } from "@/store/garments.store";
import { useSamplesStore } from "@/store/samples.store";
import { ClientesService } from "@/services/clients.service";
import { api } from "@/lib/axios";
import { endOfDay, startOfDay } from "date-fns";

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

export default function CreateGargament() {
  const navigate = useNavigate();
  const { addGarment } = useGarmentsStore.getState();
  const { samples, fetchSamples } = useSamplesStore();

  const [clientes, setClientes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const [openClienteCombo, setOpenClienteCombo] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

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

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  const getSampleId = (s) => String(s?.muestraID ?? s?.id ?? "");
  const getSampleLabel = (s) => {
    const type = s?.clotheType ?? "Muestra";
    const user = s?.client?.username ?? "Sin cliente";
    return `${type} - ${user}`;
  };

  const onSubmit = async (values) => {
    try {
      const dto = {
        TipoPrenda: values.tipoPrenda.trim(),
        NroCorte: values.nroCorte,
        CantidadUnidades: values.cantidadUnidades,
        PesoKilos: values.pesoKilos,
        CantidadBolsas: values.cantidadBolsas,
        FechaIngreso: values.fechaIngreso.toISOString(),
        Remito: values.remito?.trim() || null,
        EstadoPrendaID: values.estadoPrendaID,
        ProcesoID: values.procesoID,
        ClienteID: values.clienteID,
        MuestraID: values.muestraID ?? null,
        Observaciones: values.observaciones?.trim() || null,
      };

      const msg = await addGarment(dto);
      showToast({ title: msg || "Prenda registrada correctamente" });
      navigate({ to: "/prendas", replace: true });
    } catch (err) {
      showToast({
        title: err?.message || "Hubo un problema al registrar la prenda",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <NavigateRoute path="/prendas" />
          <CardTitle>Alta de Prenda</CardTitle>
          <CardDescription>
            Completa los datos para registrar una nueva prenda
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

              {/* Estado y Proceso (obligatorios) */}
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

              {/* Cliente (obligatorio, searchable) */}
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

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Registrando..."
                  : "Registrar Prenda"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
