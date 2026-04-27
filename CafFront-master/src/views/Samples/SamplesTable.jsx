// src/views/Samples/SamplesTable.jsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Edit,
  ArrowUpDown,
  Search,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  Settings2,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { Link } from "@tanstack/react-router";
import { useSamplesStore } from "@/store/samples.store";
import { showToast } from "@/lib/Toast";
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx";
import { format, startOfDay, endOfDay, isBefore, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";
import { Spinner } from "@/components/ui/spinner";

const estadoPillClasses = (estadoText = "") => {
  const k = String(estadoText).toLowerCase();
  if (k.includes("realizado")) return "bg-green-100 text-green-800";
  if (k.includes("entregado")) return "bg-blue-100 text-blue-800";
  if (k.includes("pendiente")) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};

export default function SamplesTable() {
  const {
    samples,
    isLoading,
    error,
    fetchSamples,
    statuses,
    fetchStatuses,
    updateEstado,
    deleteSample,
  } = useSamplesStore();

  useEffect(() => {
    fetchSamples();
    fetchStatuses();
  }, [fetchSamples, fetchStatuses]);

  // ------------ estado de modales (igual a prendas) -------------
  const [editing, setEditing] = useState(null);
  const [nuevoEstadoId, setNuevoEstadoId] = useState("");
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingSample, setDeletingSample] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ------------ filtros/orden -------------
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const canDelete = useAuthStore((s) => s.hasPermission("Muestra.Eliminar"));
  const canCreate = useAuthStore((s) => s.hasPermission("Muestra.Crear"));
  const canEdit = useAuthStore((s) => s.hasPermission("Muestra.Editar"));

  // ------------ normalización (tu backend) -------------
  const muestras = useMemo(() => {
    return (samples ?? []).map((m) => {
      const id = m.muestraID ?? m.id;
      const cliente = m.client
        ? {
            id: m.client.clientID,
            nombre: m.client.username,
            contacto: m.client.contact,
          }
        : { id: m.clienteID, nombre: `#${m.clienteID ?? "-"}`, contacto: "" };
      const fecha = m.modifiedAt ? startOfDay(new Date(m.modifiedAt)) : null;

      return {
        id,
        tipo: m.clotheType ?? m.tipoPrenda ?? "-",
        pesoKilos: m.kilogramWeight ?? m.pesoKilos ?? null,
        estado: m.status?.status ?? m.estadoMuestra ?? "-",
        estadoId: m.status?.sampleStatusID ?? null,
        fechaCreacion: fecha,
        cliente,
        observaciones: (m.observaciones ?? "")?.toString().trim() || null,
      };
    });
  }, [samples]);

  // opciones estado (desde /SampleStatus)
  const estadosOptions = useMemo(
    () =>
      Array.isArray(statuses) && statuses.length
        ? statuses.map((s) => ({ id: s.sampleStatusID, value: s.statusName }))
        : Array.from(
            new Set(
              muestras.map((x) => (x.estado || "").trim()).filter(Boolean)
            )
          ).map((v, i) => ({ id: i + 1, value: v })),
    [statuses, muestras]
  );

  const tiposOptions = useMemo(
    () => Array.from(new Set(muestras.map((x) => x.tipo).filter(Boolean))),
    [muestras]
  );

  const handleSort = (field) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    const filtered = muestras.filter((x) => {
      const inSearch =
        !searchTerm ||
        (x.cliente?.nombre || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (x.tipo || "").toLowerCase().includes(searchTerm.toLowerCase());

      const inEstado =
        filterEstado === "all" ||
        (x.estado || "").toString().toLowerCase() === filterEstado;

      const inTipo = filterTipo === "all" || (x.tipo || "") === filterTipo;

      const f = x.fechaCreacion ? startOfDay(x.fechaCreacion) : null;
      const inFrom = !from || (f && !isBefore(f, startOfDay(from)));
      const inTo = !to || (f && !isAfter(f, endOfDay(to)));

      return inSearch && inEstado && inTipo && inFrom && inTo;
    });

    filtered.sort((a, b) => {
      let av, bv;
      if (sortField === "cliente.nombre") {
        av = a.cliente?.nombre ?? "";
        bv = b.cliente?.nombre ?? "";
      } else if (sortField) {
        av = a[sortField];
        bv = b[sortField];
      } else return 0;

      if (av instanceof Date && bv instanceof Date)
        return sortDirection === "asc" ? av - bv : bv - av;
      if (typeof av === "string" && typeof bv === "string")
        return sortDirection === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      if (typeof av === "number" && typeof bv === "number")
        return sortDirection === "asc" ? av - bv : bv - av;
      return 0;
    });

    return filtered;
  }, [
    muestras,
    searchTerm,
    filterEstado,
    filterTipo,
    sortField,
    sortDirection,
    dateFrom,
    dateTo,
  ]);

  const exportXLSX = () => {
    const headers = [
      "Tipo",
      "Peso (kg)",
      "Estado",
      "Fecha",
      "Cliente",
      "Contacto",
      "Observaciones",
    ];
    const rows = filteredAndSorted.map((m) => [
      m.tipo ?? "",
      m.pesoKilos ?? "",
      m.estado ?? "",
      m.fechaCreacion
        ? format(m.fechaCreacion, "dd/MM/yyyy", { locale: es })
        : "",
      m.cliente?.nombre ?? "",
      m.cliente?.contacto ?? "",
      m.observaciones ?? "",
    ]);
    const ws = XLSXUtils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [
      { wch: 16 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 40 },
    ];
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Muestras");
    XLSXWriteFile(wb, "Muestras.xlsx");
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
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  // ---------- acciones (modal estado & eliminar) ----------
  const openEstadoModal = (item) => {
    setEditing(item);
    setNuevoEstadoId(item.estadoId ? String(item.estadoId) : "");
    setIsEstadoModalOpen(true);
  };

  const submitEstado = async () => {
    if (!editing || !nuevoEstadoId) return;
    setIsUpdating(true);
    try {
      const msg = await updateEstado(editing.id, Number(nuevoEstadoId));
      showToast({ title: msg });
      setIsEstadoModalOpen(false);
      setEditing(null);
      setNuevoEstadoId("");
    } catch (err) {
      showToast({
        icon: "error",
        title: err?.message || "No se pudo actualizar el estado",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (m) => {
    setDeletingSample(m);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingSample) return;
    setIsDeleting(true);
    try {
      const msg = await deleteSample(deletingSample.id);
      showToast({ title: msg });
      setIsDeleteModalOpen(false);
      setDeletingSample(null);
    } catch (e) {
      showToast({
        icon: "error",
        title: e.message || "No se pudo eliminar la muestra.",
      });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <NavigateRoute path="/" />
              <div>
                <CardTitle>Listado de Muestras</CardTitle>
                <CardDescription>
                  Gestiona y visualiza todas las muestras registradas
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                className={`${
                  isMobile ? "w-9 h-9 p-0" : "flex items-center gap-2"
                } bg-green-800`}
                onClick={exportXLSX}
              >
                <Download className="h-4 w-4" />
                {!isMobile && <span>Exportar a excel</span>}
              </Button>

              {canCreate && (
                <Link to="/muestras/crear" className="inline-flex">
                  <Button
                    className={`${
                      isMobile ? "w-9 h-9 p-0" : "flex items-center gap-2"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    {!isMobile && <span>Alta de muestra</span>}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
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
                  {Array.from(
                    new Set(
                      muestras
                        .map((x) =>
                          (x.estado || "").toString().trim().toLowerCase()
                        )
                        .filter(Boolean)
                    )
                  ).map((e) => (
                    <SelectItem key={e} value={e}>
                      {cap(e)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tiposOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
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
                      : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(d) => {
                      setDateFrom(d ?? null);
                      if (d && dateTo && d > dateTo) setDateTo(null);
                      setOpenFrom(false);
                    }}
                    initialFocus
                    locale={es}
                    disabled={{ after: endOfDay(new Date()) }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
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
                      : "Seleccionar"}
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
                    disabled={{
                      after: endOfDay(new Date()),
                      ...(dateFrom ? { before: startOfDay(dateFrom) } : {}),
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Loading / Error / Empty */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Spinner className="size-6 text-purple-500"/>
            </div>
          )}
          {!isLoading && error && (
            <div className="p-8 text-center text-red-600">{error}</div>
          )}
          {!isLoading && !error && filteredAndSorted.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron muestras.
            </div>
          )}

          {/* Mobile (cards) */}
          {isMobile && !isLoading && filteredAndSorted.length > 0 && (
            <div className="space-y-4">
              {filteredAndSorted.map((m) => (
                <Card key={m.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{m.tipo}</h3>
                      <p className="text-sm text-gray-500">#{m.id}</p>
                    </div>
                    <div className="flex gap-1">
                      {canEdit && (
                        <>
                          <Link
                            to="/muestras/$sampleId/editar"
                            params={{ sampleId: String(m.id) }}
                            className="inline-flex"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Editar muestra"
                            >
                              <Settings2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Editar estado"
                            onClick={() => openEstadoModal(m)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Eliminar muestra"
                          onClick={() => handleDelete(m)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>Peso: {m.pesoKilos ?? "-"} kg</div>
                    <div>
                      Estado:{" "}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${estadoPillClasses(
                          m.estado
                        )}`}
                      >
                        {cap(m.estado || "-")}
                      </span>
                    </div>
                    <div>
                      Fecha:{" "}
                      {m.fechaCreacion
                        ? format(m.fechaCreacion, "dd/MM/yyyy", { locale: es })
                        : "-"}
                    </div>
                  </div>

                  <div className="border-t pt-3 text-sm">
                    <div className="font-medium">{m.cliente?.nombre}</div>
                    <div className="text-xs text-gray-500">
                      {m.cliente?.contacto}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Desktop (tabla) */}
          {!isMobile && !isLoading && filteredAndSorted.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortButton field="tipo">Tipo</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="pesoKilos">Peso (Kg)</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="estado">Estado</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="fechaCreacion">Fecha</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="cliente.nombre">Cliente</SortButton>
                    </TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.tipo}</TableCell>
                      <TableCell>
                        {m.pesoKilos != null ? `${m.pesoKilos} kg` : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoPillClasses(
                            m.estado
                          )}`}
                        >
                          {cap(m.estado || "-")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {m.fechaCreacion
                          ? format(m.fechaCreacion, "dd/MM/yyyy", {
                              locale: es,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{m.cliente?.nombre}</div>
                          <div className="text-sm text-gray-500">
                            {m.cliente?.contacto}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {canEdit && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar estado"
                                onClick={() => openEstadoModal(m)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Link
                                to="/muestras/$sampleId/editar"
                                params={{ sampleId: String(m.id) }}
                                className="inline-flex"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Editar muestra"
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
                              title="Eliminar muestra"
                              onClick={() => handleDelete(m)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Modal cambiar estado (igual patrón que prendas) === */}
      <Dialog open={isEstadoModalOpen} onOpenChange={setIsEstadoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estado de Muestra</DialogTitle>
            <DialogDescription>
              Actualiza el estado de la muestra: {editing?.tipo}{" "}
              {editing?.id ? `(#${editing.id})` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <div className="p-2 bg-gray-100 rounded text-sm">
                {editing?.estado ?? "-"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select value={nuevoEstadoId} onValueChange={setNuevoEstadoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosOptions.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEstadoModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={submitEstado}
              disabled={
                isUpdating ||
                !nuevoEstadoId ||
                String(nuevoEstadoId) === String(editing?.estadoId)
              }
            >
              {isUpdating ? "Actualizando..." : "Actualizar Estado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Modal eliminar (igual patrón que prendas) === */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Eliminar la muestra "{deletingSample?.tipo}"? Esta acción no se
              puede deshacer.
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
              {isDeleting ? "Eliminando..." : "Eliminar muestra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
