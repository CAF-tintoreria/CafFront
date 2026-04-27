// src/views/Garments/GarmentsTable.jsx
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMediaQuery } from "@/hooks/use-mobile";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { showToast } from "@/lib/Toast";
import { useAuthStore } from "@/store/auth.store";
import { useGarmentsStore } from "@/store/garments.store";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Link, useLocation } from "@tanstack/react-router";
import { endOfDay, format, isAfter, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowUpDown,
  Building2,
  Calendar as CalendarIcon,
  Download,
  Edit,
  FileText,
  Package2,
  Plus,
  Scale,
  Search,
  Settings2,
  Trash2,
  Users2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx";

// Mapea el texto del estado a clases de “pill” como en el código anterior
const estadoPillClasses = (estadoText = "") => {
  const k = estadoText.toLowerCase();
  if (k.includes("facturado")) return "bg-green-100 text-green-800";
  if (k.includes("en proceso")) return "bg-blue-100 text-blue-800";
  if (k.includes("pendiente")) return "bg-yellow-100 text-yellow-800";
  if (k.includes("salida")) return "bg-gray-200 text-gray-800"
  if (k.includes("terminado")) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
};
export default function GarmentsTable() {
  const { state } = useLocation();

  const {
    garments,
    isLoading,
    error,
    fetchGarments,
    hydrateLookups,
    estados,
    updateEstadoGarment,
    removeGarment,
    procesos,
  } = useGarmentsStore();
  const canDelete = useAuthStore((s) => s.hasPermission("Prenda.Eliminar"));
  const canCreate = useAuthStore((s) => s.hasPermission("Prenda.Crear"));
  const canEdit = useAuthStore((s) => s.hasPermission("Prenda.Editar"));

  useEffect(() => {
    fetchGarments();
    hydrateLookups();
  }, [fetchGarments, hydrateLookups]);

  const [deletingGarment, setDeletingGarment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Estado local (igual a “ahora”) ----
  const [editing, setEditing] = useState(null);
  const [nuevoEstadoId, setNuevoEstadoId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ---- Filtros y orden (mantengo los del “antes” para la UI) ----
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState(state?.state ?? "all");
  const [filterProceso, setFilterProceso] = useState("all");
  const [filterTipoPrenda, setFilterTipoPrenda] = useState("all");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [dateFrom, setDateFrom] = useState(null); // Date | null
  const [dateTo, setDateTo] = useState(null); // Date | null
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  const [isObsOpen, setIsObsOpen] = useState(false);
  const [obsText, setObsText] = useState([]);
  const openObs = (text) => {
    setObsText(text);
    setIsObsOpen(true);
  };

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Normalizar respuesta del backend para la UI (funcionalidad “ahora”)
  const prendas = useMemo(() => {
    return (garments ?? []).map((p) => {
      const procesoActual =
        Array.isArray(p.processes) && p.processes.length
          ? p.processes[p.processes.length - 1]
          : undefined;

      const procesoNombre =
        procesoActual?.typeProcess /* ej. "Batik" */ ?? p.procesoNombre;
      ("-");

      return {
        id: p.prendaID,
        tipoPrenda: p.tipoPrenda ?? "-",
        nroCorte: p.nroCorte ?? null,
        cantidadUnidades: p.cantidadUnidades ?? null,
        pesoKilos: p.pesoKilos ?? null,
        cantidadBolsas: p.cantidadBolsas ?? null,
        fechaIngreso: p.fechaIngreso
          ? startOfDay(new Date(p.fechaIngreso))
          : null,
        remito: p.remito ?? "",
        estadoPrendaID: p.estadoPrendaID,
        procesoID: p.procesoID,
        procesoNombre, // 👈 ya queda listo para mostrar/filtrar/ordenar
        cliente: p.cliente
          ? {
              id: p.cliente.clientID,
              nombre: p.cliente.username,
              contacto: p.cliente.contact,
            }
          : { id: p.clienteID, nombre: `#${p.clienteID}`, contacto: "" },
        muestraVinculada: p.muestra?.clotheType ?? null,
        observaciones: (p.observaciones ?? "")?.toString().trim() || null,
      };
    });
  }, [garments]);

  const estadosMap = useMemo(
    () =>
      Object.fromEntries(
        (estados ?? []).map((e) => [e.estadoPrendaID, e.estadoActual])
      ),
    [estados]
  );

  // Valores únicos para filtros de Proceso / Tipo (como en “antes”)
  const tiposProceso = useMemo(
    () => (procesos ?? []).map((x) => x.nombre),
    [procesos]
  );
  const tiposPrenda = useMemo(
    () => Array.from(new Set(prendas.map((p) => p.tipoPrenda).filter(Boolean))),
    [prendas]
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Texto legible del estado (para mostrar y para el “pill”)
  const estadoTexto = (p) =>
    estadosMap[p.estadoPrendaID] ?? `#${p.estadoPrendaID ?? "-"}`;

  const filteredAndSorted = useMemo(() => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    if (from) from.setHours(0, 0, 0, 0); // inicio del día
    if (to) to.setHours(23, 59, 59, 999); // fin del día

    const filtered = prendas.filter((x) => {
      const inSearch =
        !searchTerm ||
        (x.cliente?.nombre || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (x.tipoPrenda || "").toLowerCase().includes(searchTerm.toLowerCase());

      const inEstado =
        filterEstado === "all" ||
        String(x.estadoPrendaID) === String(filterEstado);

      const inProceso =
        filterProceso === "all" ||
        (x.procesoNombre || "").toLowerCase() ===
          (filterProceso || "").toLowerCase();

      const inTipo =
        filterTipoPrenda === "all" ||
        (x.tipoPrenda || "") === (filterTipoPrenda || "");

      const fi =
        x.fechaIngreso instanceof Date ? startOfDay(x.fechaIngreso) : null;
      const inFrom = !from || (fi && !isBefore(fi, startOfDay(from)));
      const inTo = !to || (fi && !isAfter(fi, endOfDay(to)));

      // ✅ USA AND lógico (no el operador coma)
      return inSearch && inEstado && inProceso && inTipo && inFrom && inTo;
    });

    // Improved sorting logic with default sort by latest ID
    filtered.sort((a, b) => {
      // Default sort: latest ID (descending) when no sort field is specified
      const effectiveSortField = sortField || "fechaIngreso";
      const effectiveSortDirection = sortField ? sortDirection : "desc";

      // Get sort values based on field
      let av, bv;
      switch (effectiveSortField) {
        case "cliente.nombre":
          av = a.cliente?.nombre ?? "";
          bv = b.cliente?.nombre ?? "";
          break;
        case "proceso":
          av = a.procesoNombre ?? "";
          bv = b.procesoNombre ?? "";
          break;
        default:
          av = a[effectiveSortField];
          bv = b[effectiveSortField];
          break;
      }

      // Handle null/undefined values - push them to the end
      if (av == null && bv == null) return 0;
      if (av == null) return 1; // null goes to end
      if (bv == null) return -1; // null goes to end

      // Compare based on type
      if (av instanceof Date && bv instanceof Date) {
        return effectiveSortDirection === "asc" ? av - bv : bv - av;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return effectiveSortDirection === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }
      if (typeof av === "number" && typeof bv === "number") {
        return effectiveSortDirection === "asc" ? av - bv : bv - av;
      }

      // Fallback: convert to string and compare
      const strA = String(av);
      const strB = String(bv);
      return effectiveSortDirection === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });

    return filtered;
  }, [
    prendas,
    searchTerm,
    filterEstado,
    filterProceso,
    filterTipoPrenda,
    sortField,
    sortDirection,
    dateFrom,
    dateTo,
  ]);
    const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
    const paginatedItems = filteredAndSorted.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

  const exportXLSX = () => {
    // Encabezados
    const headers = [
      "Tipo",
      "Nro corte",
      "Unidades",
      "Peso (kg)",
      "Bolsas",
      "Fecha ingreso",
      "Remito",
      "Estado",
      "Proceso",
      "Cliente",
      "Contacto",
      "Muestra",
      "Observaciones",
    ];

    // Filas desde lo que se ve en pantalla
    const rows = paginatedItems.map((p) => {
      const fecha = p.fechaIngreso
        ? format(p.fechaIngreso, "dd/MM/yyyy", { locale: es })
        : "";
      const estado = estadoTexto(p);
      return [
        p.tipoPrenda ?? "",
        p.nroCorte ?? "",
        p.cantidadUnidades ?? "",
        p.pesoKilos ?? "",
        p.cantidadBolsas ?? "",
        fecha,
        p.remito || "",
        estado,
        p.procesoNombre || "",
        p.cliente?.nombre || "",
        p.cliente?.contacto || "",
        p.muestraVinculada || "",
        p.observaciones || "",
      ];
    });

    // Armamos hoja con AOAs (arrays de arrays)
    const ws = XLSXUtils.aoa_to_sheet([headers, ...rows]);

    // Ancho de columnas (opcional)
    ws["!cols"] = [
      { wch: 12 }, // Tipo
      { wch: 10 }, // Nro Corte
      { wch: 10 }, // Unidades
      { wch: 10 }, // Peso
      { wch: 8 }, // Bolsas
      { wch: 12 }, // Fecha
      { wch: 12 }, // Remito
      { wch: 12 }, // Estado
      { wch: 12 }, // Proceso
      { wch: 18 }, // Cliente
      { wch: 20 }, // Contacto
      { wch: 25 }, // Muestra
      { wch: 40 }, // Observaciones
    ];

    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Prendas");
    if (dateFrom || dateTo) {
      const f1 = dateFrom ? format(dateFrom, "yyyy-MM-dd") : "";
      const f2 = dateTo ? format(dateTo, "yyyy-MM-dd") : "";
      XLSXWriteFile(wb, `Prendas_${f1}_${f2}.xlsx`);
      return;
    }
    XLSXWriteFile(wb, "Prendas.xlsx");
  };

  const handleDelete = async (prenda) => {
    setDeletingGarment(prenda);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingGarment) return;
    setIsDeleting(true);
    try {
      const msg = await removeGarment(deletingGarment.id);
      setIsDeleteModalOpen(false);
      setDeletingGarment(null);
      showToast({ title: msg });
    } catch (err) {
      showToast({ title: err.message, icon: "error" });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEstadoModal = (item) => {
    setEditing(item);
    setNuevoEstadoId(String(item.estadoPrendaID ?? ""));
    setIsModalOpen(true);
  };

  const submitEstado = async () => {
    if (!editing || !nuevoEstadoId) return;
    setIsUpdating(true);
    try {
      const msg = await updateEstadoGarment(editing.id, Number(nuevoEstadoId));
      showToast({ title: msg });
      setIsModalOpen(false);
      setEditing(null);
      setNuevoEstadoId("");
    } catch (err) {
      showToast({
        title: err?.message || "No se pudo actualizar el estado",
        icon: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const SortButton = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 p-0 font-semibold hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <NavigateRoute path="/" />
              <div>
                <CardTitle>Listado de prendas</CardTitle>
                <CardDescription>
                  Gestiona y visualiza todas las prendas registradas
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                className={`${
                  isMobile ? "w-9 h-9 p-0" : "flex items-center gap-2"
                } bg-green-800`}
                onClick={exportXLSX}
                aria-label="Exportar a Excel"
                title="Exportar a Excel"
              >
                <Download className="h-4 w-4" />
                {!isMobile && <span>Exportar a excel</span>}
              </Button>

              {canCreate && (
                <Link to="/prendas/crear" className="inline-flex">
                  <Button
                    className={`${
                      isMobile ? "w-9 h-9 p-0" : "flex items-center gap-2"
                    }`}
                    aria-label="Alta de prenda"
                    title="Alta de prenda"
                  >
                    <Plus className="h-4 w-4" />
                    {!isMobile && <span>Alta de prenda</span>}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros como en el “antes” */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-5">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tipo o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(estados ?? []).map((e) => (
                    <SelectItem
                      key={e.estadoPrendaID}
                      value={String(e.estadoPrendaID)}
                    >
                      {e.estadoActual}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proceso</Label>
              <Select value={filterProceso} onValueChange={setFilterProceso}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tiposProceso.map((proceso) => (
                    <SelectItem key={proceso} value={proceso}>
                      {proceso.charAt(0).toUpperCase() + proceso.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Prenda</Label>
              <Select
                value={filterTipoPrenda}
                onValueChange={setFilterTipoPrenda}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tiposPrenda.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Desde</Label>
              <Popover open={openFrom} onOpenChange={setOpenFrom}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !dateFrom ? "text-muted-foreground" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom
                      ? format(dateFrom, "dd/MM/yyyy", { locale: es })
                      : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(d) => {
                      setDateFrom(d ?? null);
                      // si el “desde” queda después del “hasta”, reseteo “hasta”
                      if (d && dateTo && d > dateTo) setDateTo(null);
                      setOpenFrom(false);
                    }}
                    initialFocus
                    locale={es}
                    disabled={{ after: endOfDay(new Date()) }} // no futuro
                    modifiers={{
                      today: startOfDay(new Date()),
                      future: { after: endOfDay(new Date()) },
                    }}
                    modifiersClassNames={{
                      future:
                        "opacity-40 text-muted-foreground cursor-not-allowed",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Hasta</Label>
              <Popover open={openTo} onOpenChange={setOpenTo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !dateTo ? "text-muted-foreground" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo
                      ? format(dateTo, "dd/MM/yyyy", { locale: es })
                      : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(d) => {
                      setDateTo(d ?? null);
                      setOpenTo(false);
                    }}
                    initialFocus
                    locale={es}
                    // no permitir futuro ni antes del “desde” (si existe)
                    disabled={{
                      after: endOfDay(new Date()),
                      ...(dateFrom ? { before: startOfDay(dateFrom) } : {}),
                    }}
                    modifiers={{
                      today: startOfDay(new Date()),
                      future: { after: endOfDay(new Date()) },
                      ...(dateFrom
                        ? { beforeMin: { before: startOfDay(dateFrom) } }
                        : {}),
                    }}
                    modifiersClassNames={{
                      future:
                        "opacity-40 text-muted-foreground cursor-not-allowed",
                      beforeMin:
                        "opacity-40 text-muted-foreground cursor-not-allowed",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterEstado("all");
                  setFilterProceso("all");
                  setFilterTipoPrenda("all");
                  setDateFrom(null);
                  setDateTo(null);
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {/* Loading / Error / Empty */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Spinner className="size-6 text-purple-500" />
            </div>
          )}
          {!isLoading && error && (garments?.length ?? 0) === 0 && (
            <div className="p-8 text-center text-red-600">{error}</div>
          )}
          {!isLoading && !error && filteredAndSorted.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron prendas.
            </div>
          )}

          {/* Vista Mobile (cards) como en el “antes” */}
          {isMobile && !isLoading && filteredAndSorted.length > 0 ? (
            <div className="space-y-4">
              {paginatedItems.map((p) => {
                const estText = estadoTexto(p);
                return (
                  <Card key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {p.tipoPrenda}{" "}
                            <span className="text-gray-900/50">#{p.id}</span>
                          </h3>
                          <p className="text-sm text-gray-500">
                            Corte #{p.nroCorte ?? "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {p.observaciones && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openObs([p.observaciones, p.tipoPrenda])
                            }
                            title="Ver observación"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        )}
                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEstadoModal(p)}
                              title="Editar estado"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Link
                              to="/prendas/$prendaId/editar"
                              params={{ prendaId: String(p.id) }}
                              className="inline-flex"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar prenda"
                              >
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </Link>
                          </>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p)}
                            title="Eliminar prenda"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Package2 className="h-4 w-4 text-gray-400" />
                        <span>{p.cantidadUnidades ?? "-"} unidades</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-gray-400" />
                        <span>{p.pesoKilos ?? "-"} kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package2 className="h-4 w-4 text-gray-400" />
                        <span>{p.cantidadBolsas ?? "-"} bolsas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>
                          {p.fechaIngreso
                            ? format(p.fechaIngreso, "dd/MM/yyyy", {
                                locale: es,
                              })
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {p.remito ? (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Remito: {p.remito}</span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoPillClasses(
                          estText
                        )}`}
                      >
                        {estText.charAt(0).toUpperCase() + estText.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {(p.procesoNombre || "-")
                          .toString()
                          .replace(/^#/, "") // si viene #ID, lo mostramos literal
                          .replace(/^\s+|\s+$/g, "")}
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">
                            {p.cliente?.nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            {p.cliente?.contacto}
                          </div>
                        </div>
                      </div>
                      {p.muestraVinculada && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Muestra:</strong> {p.muestraVinculada}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : null}

          {/* Vista Desktop (tabla) igual a la del “antes” */}
          {!isMobile && !isLoading && filteredAndSorted.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortButton field="id">ID</SortButton>
                    </TableHead>
                    <TableHead className="sticky left-0 bg-white z-10">
                      <SortButton field="cliente.nombre">Cliente</SortButton>
                    </TableHead>
                    <TableHead className="sticky left-[120px] bg-white z-10">
                      <SortButton field="tipoPrenda">Tipo</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="nroCorte">Nro corte</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="cantidadUnidades">Unidades</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="pesoKilos">Peso (Kg)</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="cantidadBolsas">Bolsas</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="fechaIngreso">
                        Fecha ingreso
                      </SortButton>
                    </TableHead>
                    <TableHead>Remito</TableHead>
                    <TableHead>
                      <SortButton field="estadoPrenda">Estado</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="proceso">Proceso</SortButton>
                    </TableHead>
                    <TableHead>Muestra</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((p) => {
                    const estText = estadoTexto(p);
                    return (
                        <TableRow key={p.id}>
                            <TableCell>#{p.id}</TableCell>
                            <TableCell className="sticky left-0 bg-white z-10">
                                <div>
                                    <div className="font-medium">
                                        {p.cliente?.nombre}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {p.cliente?.contacto}
                                    </div>
                                </div>
                            </TableCell>
                        <TableCell className="sticky left-[120px] bg-white z-10 font-medium">
                          {p.tipoPrenda}
                        </TableCell>
                        <TableCell>{p.nroCorte ?? "-"}</TableCell>
                        <TableCell>{p.cantidadUnidades ?? "-"}</TableCell>
                        <TableCell>
                          {p.pesoKilos != null ? `${p.pesoKilos} kg` : "-"}
                        </TableCell>
                        <TableCell>{p.cantidadBolsas ?? "-"}</TableCell>
                        <TableCell>
                          {p.fechaIngreso
                            ? format(p.fechaIngreso, "dd/MM/yyyy", {
                                locale: es,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>{p.remito || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoPillClasses(
                              estText
                            )}`}
                          >
                            {estText.charAt(0).toUpperCase() + estText.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {p.procesoNombre
                            ? p.procesoNombre.charAt(0).toUpperCase() +
                              p.procesoNombre.slice(1)
                            : "-"}
                        </TableCell>

                        <TableCell className="max-w-xs">
                          {p.muestraVinculada ? (
                            <span
                              className="text-sm text-gray-600 truncate block"
                              title={p.muestraVinculada}
                            >
                              {p.muestraVinculada}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {canEdit && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEstadoModal(p)}
                                  title="Editar estado"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Link
                                  to="/prendas/$prendaId/editar"
                                  params={{ prendaId: String(p.id) }}
                                  className="inline-flex"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Editar prenda completa"
                                  >
                                    <Settings2 className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </>
                            )}
                            {p.observaciones && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Ver observación"
                                onClick={() =>
                                  openObs([p.observaciones, p.tipoPrenda])
                                }
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Eliminar prenda"
                                onClick={() => handleDelete(p)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
                          <Button
                              variant="outline"
                              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                              disabled={currentPage === 1}
                          >
                              Anterior
                          </Button>
                          <span className="text-sm text-gray-600">
                              Página {currentPage} de {totalPages}
                          </span>
                          <Button
                              variant="outline"
                              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                              disabled={currentPage === totalPages}
                          >
                              Siguiente
                          </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal editar estado (misma lógica “ahora”) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estado de Prenda</DialogTitle>
            <DialogDescription>
              Actualiza el estado de la prenda: {editing?.tipoPrenda}
              {editing?.nroCorte ? ` - Corte #${editing?.nroCorte}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Estado actual (cajita gris) */}
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <div className="p-2 bg-gray-100 rounded text-sm">
                {(() => {
                  const actual =
                    (estados ?? []).find(
                      (e) => e.estadoPrendaID === editing?.estadoPrendaID
                    )?.estadoActual ??
                    (editing?.estadoPrendaID != null
                      ? `#${editing?.estadoPrendaID}`
                      : "-");
                  return actual;
                })()}
              </div>
            </div>

            {/* Nuevo estado (select) */}
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select value={nuevoEstadoId} onValueChange={setNuevoEstadoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  {(estados ?? []).map((e) => (
                    <SelectItem
                      key={e.estadoPrendaID}
                      value={String(e.estadoPrendaID)}
                    >
                      {e.estadoActual}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={submitEstado}
              disabled={
                isUpdating ||
                !nuevoEstadoId ||
                String(nuevoEstadoId) === String(editing?.estadoPrendaID)
              }
            >
              {isUpdating ? "Actualizando..." : "Actualizar Estado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isObsOpen} onOpenChange={setIsObsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{obsText[1]}</DialogTitle>
            <DialogDescription className="mt-5 font-bold">
              Observación:
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 p-3 rounded bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap">
            {obsText[0]}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsObsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Eliminar la prenda "{deletingGarment?.tipoPrenda}"? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar prenda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
