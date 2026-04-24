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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Download,
  Search,
  ShieldAlert,
  Activity,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCcw,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { es } from "date-fns/locale";
import { format, startOfDay, endOfDay } from "date-fns";
import { useAuditStore } from "@/store/audit.store";
import { Calendar } from "@/components/ui/calendar";
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx";
import { Spinner } from "@/components/ui/spinner";
import { NavigateRoute } from "@/lib/NavigateRoute";

// ====== mapping de colores ======
const opPillClasses = (op = "") => {
  const k = (op || "").toUpperCase();
  if (k.startsWith("DELETE")) return "bg-red-100 text-red-800";
  if (k.startsWith("CREATE")) return "bg-green-100 text-green-800";
  if (k.startsWith("UPDATE-ESTADO") || k.startsWith("UPDATE-PROCESO"))
    return "bg-amber-100 text-amber-800";
  if (k.startsWith("UPDATE")) return "bg-violet-100 text-violet-800";
  return "bg-gray-100 text-gray-800";
};

const entityPillClasses = (ent = "") => {
  const k = (ent || "").toLowerCase();
  if (k === "prenda") return "bg-blue-100 text-blue-800";
  if (k === "muestra") return "bg-orange-100 text-orange-800";
  if (k === "cliente" || k === "client") return "bg-purple-100 text-purple-800";
  if (k === "usuario") return "bg-teal-100 text-teal-800";
  return "bg-gray-100 text-gray-800";
};

function pretty(json) {
  if (!json) return "";
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}

const ENTIDADES = ["Prenda", "Muestra", "Cliente"];
const OPERACIONES = [
  "CREATE",
  "UPDATE",
  "UPDATE-ESTADO",
  "UPDATE-PROCESO",
  "ADD-PROCESO",
  "DELETE",
];

export default function AuditTable() {
  const { rows, isLoading, error, fetchAudit } = useAuditStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // filtros (solo frontend)
  const [entity, setEntity] = useState("all");
  const [operation, setOperation] = useState("all");
  const [actor, setActor] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  // orden
  const [sortField, setSortField] = useState(""); // "fecha" | "operacion" | "entidad" | "usuario" | "rol"
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // 10/25/50/100

  // búsqueda texto libre
  const [search, setSearch] = useState("");

  // modal diff
  const [openDiff, setOpenDiff] = useState(false);
  const [diffRow, setDiffRow] = useState(null);

  // traigo una vez (o refresco manual)
  const refresh = () =>
    fetchAudit({ /* sin params: trae todo */ page: 1, pageSize: 1000 });
  useEffect(() => {
    refresh(); /* eslint-disable-next-line */
  }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1); // al ordenar, volvemos a la primera página
  };

  // filtrado 100% local (como prendas)
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return (rows ?? []).filter((r) => {
      // entidad
      const inEntity =
        entity === "all" || r.entidad?.toLowerCase() === entity.toLowerCase();

      // operación
      const inOp =
        operation === "all" ||
        (r.operacion || "").toUpperCase() === operation.toUpperCase();

      // actor
      const inActor =
        !actor ||
        (r.actorNombre || "").toLowerCase().includes(actor.toLowerCase());

      // fechas
      const f = r.fecha ? new Date(r.fecha) : null;
      const inFrom = !from || (f && f >= from);
      const inTo = !to || (f && f <= to);

      // búsqueda libre (usuario/rol/operación/entidad/información/ip)
      const inSearch =
        !s ||
        (r.actorNombre || "").toLowerCase().includes(s) ||
        (r.actorRol || "").toLowerCase().includes(s) ||
        (r.operacion || "").toLowerCase().includes(s) ||
        (r.entidad || "").toLowerCase().includes(s) ||
        (r.extra || "").toLowerCase().includes(s) ||
        (r.ipRemota || "").toLowerCase().includes(s);

      return inEntity && inOp && inActor && inFrom && inTo && inSearch;
    });
  }, [rows, entity, operation, actor, dateFrom, dateTo, search]);

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

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (!sortField) return arr;

    const getVal = (r) => {
      switch (sortField) {
        case "fecha":
          return r.fecha ? new Date(r.fecha) : new Date(0);
        case "operacion":
          return (r.operacion || "").toLowerCase();
        case "entidad":
          return (r.entidad || "").toLowerCase();
        case "usuario":
          return (r.actorNombre || "").toLowerCase();
        case "rol":
          return (r.actorRol || "").toLowerCase();
        default:
          return "";
      }
    };

    arr.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      if (av instanceof Date && bv instanceof Date) {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // resetear página cuando cambian filtros principales
  useEffect(() => {
    setPage(1);
  }, [entity, operation, actor, dateFrom, dateTo, search]);

  const limpiar = () => {
    setOperation("all");
    setEntity("all");
    setActor("");
    setDateFrom(null);
    setDateTo(null);
    setSearch("");
  };

  const exportXLSX = () => {
    const headers = [
      "Fecha",
      "Operación",
      "Entidad",
      "ID",
      "Usuario - Rol",
      "Información",
      "IP",
    ];
    const rowsx = sorted.map((r) => [
      format(new Date(r.fecha), "dd/MM/yyyy HH:mm", { locale: es }),
      r.operacion,
      r.entidad,
      r.entidadID ?? "",
      `${r.actorNombre ?? ""}${r.actorRol ? " (" + r.actorRol + ")" : ""}`,
      r.extra ?? "",
      r.ipRemota ?? "",
    ]);
    const ws = XLSXUtils.aoa_to_sheet([headers, ...rowsx]);
    ws["!cols"] = [
      { wch: 18 },
      { wch: 16 },
      { wch: 12 },
      { wch: 8 },
      { wch: 24 },
      { wch: 40 },
      { wch: 14 },
    ];
    const wb = XLSXUtils.book_new();
    const entidadNombre = entity === "all" ? "Todas" : entity;
    XLSXUtils.book_append_sheet(wb, ws, "Auditoría");
    XLSXWriteFile(wb, `Auditoria_${entidadNombre}.xlsx`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <NavigateRoute path="/" />
              <Activity className="h-6 w-6 text-purple-700" />
              <div>
                <CardTitle>Auditoría</CardTitle>
                <CardDescription>
                  Historial de cambios y acciones
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="bg-green-800 hover:bg-green-900 cursor-pointer"
                onClick={exportXLSX}
                title="Exportar a Excel"
                aria-label="Exportar a Excel"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              <Button
                className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
                onClick={refresh}
                title="Refrescar"
                aria-label="Refrescar"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refrescar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros (en vivo, sin aplicar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
            <div className="space-y-2">
              <Label>Entidad</Label>
              <Select value={entity} onValueChange={setEntity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {ENTIDADES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Operación</Label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {OPERACIONES.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                placeholder="Nombre de usuario..."
                value={actor}
                onChange={(e) => setActor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Desde</Label>
              <Popover open={openFrom} onOpenChange={setOpenFrom}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${
                      !dateFrom ? "text-muted-foreground" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom
                      ? format(dateFrom, "dd/MM/yyyy", { locale: es })
                      : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom ?? undefined}
                    onSelect={(d) => {
                      setDateFrom(d ?? null);
                      setOpenFrom(false);
                    }}
                    initialFocus
                    locale={es}
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
                    className={`w-full justify-start ${
                      !dateTo ? "text-muted-foreground" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo
                      ? format(dateTo, "dd/MM/yyyy", { locale: es })
                      : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo ?? undefined}
                    onSelect={(d) => {
                      setDateTo(d ?? null);
                      setOpenTo(false);
                    }}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={limpiar} className="w-full">
                Limpiar
              </Button>
            </div>
          </div>

          {/* búsqueda libre + estado */}
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar en usuario, rol, operación, entidad o información..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {isLoading && <Spinner className="size-5 text-purple-500" />}
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </div>

          {/* Mobile cards */}
          {isMobile && !isLoading && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Sin resultados
            </div>
          )}
          {isMobile && !isLoading && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((r) => (
                <Card key={r.auditID} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        {format(new Date(r.fecha), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${opPillClasses(
                            r.operacion
                          )}`}
                        >
                          {r.operacion}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${entityPillClasses(
                            r.entidad
                          )}`}
                        >
                          {r.entidad}
                        </span>
                        {r.entidadID != null && (
                          <span className="text-xs text-gray-500">
                            #{r.entidadID}
                          </span>
                        )}
                      </div>
                    </div>
                    <ShieldAlert className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="text-sm">
                    <strong>Usuario - Rol:</strong> {r.actorNombre}{" "}
                    <span className="opacity-60">({r.actorRol})</span>
                  </div>

                  {r.extra && (
                    <div className="text-sm text-gray-700">
                      <strong>Información:</strong> {r.extra}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDiffRow(r);
                        setOpenDiff(true);
                      }}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Desktop table */}
          {!isMobile && !isLoading && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Sin resultados
            </div>
          )}
          {!isMobile && !isLoading && filtered.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortButton field="fecha">Fecha</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="operacion">Operación</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="entidad">Entidad</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="usuario">Usuario - Rol</SortButton>
                    </TableHead>
                    <TableHead>Información</TableHead> {/* sin orden */}
                    <TableHead>Detalle</TableHead> {/* sin orden */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((r) => (
                    <TableRow key={r.auditID}>
                      <TableCell>
                        {format(new Date(r.fecha), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${opPillClasses(
                            r.operacion
                          )}`}
                        >
                          {r.operacion}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${entityPillClasses(
                              r.entidad
                            )}`}
                          >
                            {r.entidad}
                          </span>
                          {r.entidadID != null && (
                            <span className="text-xs text-gray-500">
                              #{r.entidadID}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{r.actorNombre}</div>
                        <div className="text-xs text-gray-500">
                          {r.actorRol}
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={r.extra ?? ""}
                      >
                        {r.extra ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDiffRow(r);
                            setOpenDiff(true);
                          }}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-medium">
                    {total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, total)}
                  </span>{" "}
                  de <span className="font-medium">{total}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Filas por página</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => {
                        setPageSize(Number(v));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[90px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 25, 50, 100].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(1)}
                      disabled={currentPage === 1}
                      title="Primera página"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      title="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="mx-2 text-sm">
                      {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                      title="Página siguiente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      title="Última página"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: diff */}
      <Dialog open={openDiff} onOpenChange={setOpenDiff}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle auditoría #{diffRow?.auditID}</DialogTitle>
            <DialogDescription>
              {diffRow?.entidad}{" "}
              {diffRow?.entidadID ? `#${diffRow.entidadID}` : ""} —{" "}
              {diffRow?.operacion}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
            <div>
              <div className="font-semibold mb-2">Antes</div>
              <pre className="text-xs p-2 bg-muted rounded whitespace-pre-wrap break-words">
                {pretty(diffRow?.datosPrevios)}
              </pre>
            </div>
            <div>
              <div className="font-semibold mb-2">Después</div>
              <pre className="text-xs p-2 bg-muted rounded whitespace-pre-wrap break-words">
                {pretty(diffRow?.datosNuevos)}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenDiff(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
