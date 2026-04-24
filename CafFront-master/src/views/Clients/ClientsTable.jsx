import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
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
import { Edit, ArrowUpDown, Search, Plus, Trash2, User } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { useClientsStore } from "@/store/client.store";
import { showToast } from "@/lib/Toast";
import { useAuthStore } from "@/store/auth.store";
import { Download } from "lucide-react";
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx";
import { Spinner } from "@/components/ui/spinner";

export default function ClientsTable() {
  const { isLoading, error, fetchClients, removeClient, clients } =
    useClientsStore();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const [deletingClient, setDeletingClient] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  const canDelete = useAuthStore((s) => s.hasPermission("Clientes.Eliminar"));
  const canCreate = useAuthStore((s) => s.hasPermission("Clientes.Crear"));
  const canEdit = useAuthStore((s) => s.hasPermission("Clientes.Editar"));

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 🔄 Normalizamos los datos del store
  const clientesNormalizados = useMemo(
    () =>
      (clients || []).map((c) => ({
        id: c.clientID,
        nombre: c.username,
        contacto: c.contact || "Sin contacto",
        estado: c.state ? "Activo" : "Inactivo",
      })),
    [clients]
  );

  // 🔍 Filtrado y ordenamiento
  const filteredAndSortedClientes = useMemo(() => {
    const filtered = clientesNormalizados.filter((cliente) => {
      const matchesSearch =
        !searchTerm ||
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.contacto.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState =
        filterState === "all" ||
        (filterState === "active" && cliente.estado === "Activo") ||
        (filterState === "inactive" && cliente.estado === "Inactivo");

      return matchesSearch && matchesState;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [clientesNormalizados, searchTerm, filterState, sortField, sortDirection]);

  const handleDeleteClient = (cliente) => {
    setDeletingClient(cliente);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);
    try {
      const msg = await removeClient(deletingClient.id);
      showToast({ title: msg });
    } catch (err) {
      showToast({
        title:
          err?.message ||
          "No se pudo eliminar el cliente. Es posible que tenga prendas o muestras asociadas.",
        icon: "error",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeletingClient(null);
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

  const exportXLSX = () => {
    // Encabezados
    const headers = ["Nombre", "Contacto", "Estado"];

    // Filas desde lo que se ve en pantalla
    const rows = filteredAndSortedClientes.map((p) => {
      return [p.nombre ?? "", p.contacto ?? "", p.estado ?? ""];
    });

    // Armamos hoja con AOAs (arrays de arrays)
    const ws = XLSXUtils.aoa_to_sheet([headers, ...rows]);

    // Ancho de columnas (opcional)
    ws["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 12 }];

    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Clientes");
    XLSXWriteFile(wb, "Clientes.xlsx");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NavigateRoute path="/" />
              <div>
                <CardTitle>Gestión de Clientes</CardTitle>
                <CardDescription>
                  Administra los clientes del sistema
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
                <Link to="/clientes/crear" className="inline-flex">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Cliente
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre o contacto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterState("all");
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
              <Spinner className="size-6 text-purple-500"/>
            </div>
          )}

          {!isLoading && error && (
            <div className="p-8 text-center text-red-600">{error}</div>
          )}

          {!isLoading && !error && filteredAndSortedClientes.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron clientes.
            </div>
          )}

          {!isLoading && !error && filteredAndSortedClientes.length > 0 && (
            <>
              {isMobile ? (
                // 🟣 Vista Mobile
                <div className="space-y-4">
                  {filteredAndSortedClientes.map((cliente) => (
                    <Card key={cliente.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {cliente.nombre}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {cliente.contacto}
                            </p>
                            <p className="text-xs text-gray-400">
                              Estado: {cliente.estado}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {canEdit && (
                            <Link
                              to={`/clientes/${cliente.id}/editar`}
                              className="inline-flex"
                            >
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClient(cliente)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                // 🖥️ Vista Desktop
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <SortButton field="id">ID</SortButton>
                        </TableHead>
                        <TableHead>
                          <SortButton field="nombre">Nombre</SortButton>
                        </TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>
                          <SortButton field="estado">Estado</SortButton>
                        </TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedClientes.map((cliente) => (
                        <TableRow key={cliente.id}>
                          <TableCell>#{cliente.id}</TableCell>
                          <TableCell>{cliente.nombre}</TableCell>
                          <TableCell>{cliente.contacto}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                cliente.estado === "Activo"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {cliente.estado}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {canEdit && (
                                <Link
                                  to={`/clientes/${cliente.id}/editar`}
                                  className="inline-flex"
                                >
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClient(cliente)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal confirmación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Eliminar al cliente "{deletingClient?.nombre}"? Esta acción no se
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
              {isDeleting ? "Eliminando..." : "Eliminar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
