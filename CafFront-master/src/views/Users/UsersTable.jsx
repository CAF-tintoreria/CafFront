// src/views/Users/UsersTable.jsx
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
import { Edit, ArrowUpDown, Search, Plus, Trash2, Lock } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Shield, UserCheck } from "lucide-react";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { useUsersStore } from "@/store/users.store";
import { showToast } from "@/lib/Toast";
import {
  useRolesPermissionsStore,
  ROLE_COLOR_PALETTE,
} from "@/store/rolesPermissions.store";
import { Download } from "lucide-react";
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx";
import { useAuthStore } from "@/store/auth.store"; // 👈 para saber si es Admin
import { Spinner } from "@/components/ui/spinner";

export default function UsersTable() {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    removeUser,
    changeUserPassword,
  } = useUsersStore();
  const { roles, fetchRolesOnly, getRoleColor } = useRolesPermissionsStore();

  const rolActual = useAuthStore((s) => s.rol);
  const esAdmin = rolActual === "Administrador";

  const canDelete = useAuthStore((s) => s.hasPermission("Usuarios.Eliminar"));
  const canCreate = useAuthStore((s) => s.hasPermission("Usuarios.Crear"));
  const canEdit = useAuthStore((s) => s.hasPermission("Usuarios.Editar"));

  const token = localStorage.getItem("token");
  const currentUserId = token
    ? parseInt(JSON.parse(atob(token.split(".")[1]))?.sub, 10)
    : undefined;

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  useEffect(() => {
    fetchRolesOnly();
  }, [fetchRolesOnly]);

  // --- Estado del modal de cambio de contraseña
  const [pwdUser, setPwdUser] = useState(null);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  // --- Estado del modal de borrar (como ya estaba)
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ... filtros/orden y helpers (sin cambios)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("all");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSort = (field) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const usuariosNormalizados = useMemo(
    () =>
      (users || []).map((u) => ({
        id: u.userId,
        nombre: u.username,
        rol: (u.role || "").toLowerCase(),
        rolColorKey: getRoleColor(u.role),
      })),
    [users, getRoleColor]
  );

  const roleOptions = useMemo(() => {
    const fromUsers = new Set(
      (usuariosNormalizados || []).map((u) => u.rol).filter(Boolean)
    );
    const fromCatalog = new Set(
      (roles || [])
        .map((r) => String(r.name || "").toLowerCase())
        .filter(Boolean)
    );
    return Array.from(new Set([...fromUsers, ...fromCatalog])).sort();
  }, [usuariosNormalizados, roles]);

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const exportXLSX = () => {
    const headers = ["ID", "Nombre", "Rol"];
    const rows = filteredAndSortedUsuarios.map((u) => [
      u.id,
      u.nombre ?? "",
      cap(u.rol ?? ""),
    ]);
    const ws = XLSXUtils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [{ wch: 8 }, { wch: 24 }, { wch: 18 }];
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Usuarios");
    XLSXWriteFile(wb, "Usuarios.xlsx");
  };

  const filteredAndSortedUsuarios = useMemo(() => {
    const filtered = usuariosNormalizados.filter((usuario) => {
      const matchesSearch =
        !searchTerm ||
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.rol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRol = filterRol === "all" || usuario.rol === filterRol;
      return matchesSearch && matchesRol;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField],
        bValue = b[sortField];
      if (typeof aValue === "string" && typeof bValue === "string")
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      if (typeof aValue === "number" && typeof bValue === "number")
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      return 0;
    });

    return filtered;
  }, [usuariosNormalizados, searchTerm, filterRol, sortField, sortDirection]);

  // ---- eliminar (igual que tenías)
  const handleDeleteUser = (usuario) => {
    if (usuario.id === currentUserId) {
      showToast({
        title: "No podés eliminar tu propio usuario.",
        icon: "error",
      });
      return;
    }
    setDeletingUser(usuario);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const msg = await removeUser(deletingUser.id);
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
      showToast({ title: msg });
    } catch (err) {
      showToast({ title: err.message, icon: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // ---- cambio de contraseña
  const openPwdModal = (usuario) => {
    setPwdUser(usuario);
    setPwd1("");
    setPwd2("");
    setPwdOpen(true);
  };

  const submitPwdChange = async () => {
    if (!pwdUser) return;
    if (!pwd1 || !pwd2) {
      showToast({ title: "Completá ambos campos.", icon: "warning" });
      return;
    }
    if (pwd1.length < 6) {
      showToast({
        title: "La contraseña debe tener al menos 6 caracteres.",
        icon: "warning",
      });
      return;
    }
    if (pwd1 !== pwd2) {
      showToast({ title: "Las contraseñas no coinciden.", icon: "warning" });
      return;
    }

    setPwdSaving(true);
    try {
      await changeUserPassword(
        { nombre: pwdUser.nombre, rol: pwdUser.rol }, // rol en minúscula -> store lo capitaliza
        pwd1
      );
      showToast({ title: `Contraseña actualizada para ${pwdUser.nombre}.` });
      setPwdOpen(false);
      setPwdUser(null);
      setPwd1("");
      setPwd2("");
    } catch (err) {
      showToast({
        title: err?.message || "No se pudo cambiar la contraseña.",
        icon: "error",
      });
    } finally {
      setPwdSaving(false);
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
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra los usuarios del sistema
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
                <Link to="/usuarios/crear" className="inline-flex">
                  <Button
                    className={`${
                      isMobile ? "w-9 h-9 p-0" : "flex items-center gap-2"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    {!isMobile && <span>Crear Usuario</span>}
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
                  placeholder="Nombre o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={filterRol} onValueChange={setFilterRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {cap(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterRol("all");
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
          {/* Tabla / Cards */}
          {!isLoading && !error && filteredAndSortedUsuarios.length > 0 && (
            <>
              {isMobile ? (
                <div className="space-y-4">
                  {filteredAndSortedUsuarios.map((usuario) => (
                    <Card key={usuario.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              usuario.rol === "administrador"
                                ? "bg-purple-100"
                                : "bg-blue-100"
                            }`}
                          >
                            {usuario.rol === "administrador" ? (
                              <Shield className="h-5 w-5 text-purple-600" />
                            ) : (
                              <UserCheck className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {usuario.nombre}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ID #{usuario.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {canEdit && (
                            <Link
                              to={`/usuarios/${usuario.id}/editar`}
                              className="inline-flex"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar usuario"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}

                          {esAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Cambiar contraseña"
                              onClick={() => openPwdModal(usuario)}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                          {usuario.id !== currentUserId && canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(usuario)}
                              title="Eliminar usuario"
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
                        <TableHead>
                          <SortButton field="rol">Rol</SortButton>
                        </TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedUsuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">
                            #{usuario.id}
                          </TableCell>
                          <TableCell>{usuario.nombre}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                ROLE_COLOR_PALETTE[usuario.rolColorKey]
                                  ?.badge || ROLE_COLOR_PALETTE.blue.badge
                              }`}
                            >
                              {usuario.rol.charAt(0).toUpperCase() +
                                usuario.rol.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {canEdit && (
                                <Link
                                  to={`/usuarios/${usuario.id}/editar`}
                                  className="inline-flex"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Editar usuario"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}

                              {esAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Cambiar contraseña"
                                  onClick={() => openPwdModal(usuario)}
                                >
                                  <Lock className="h-4 w-4" />
                                </Button>
                              )}

                              {usuario.id !== currentUserId && canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(usuario)}
                                  title="Eliminar usuario"
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

      {/* Modal eliminar (ya lo tenías) */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Eliminar al usuario "{deletingUser?.nombre}"? Esta acción no se
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
              {isDeleting ? "Eliminando..." : "Eliminar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal cambio de contraseña */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Usuario: <strong>{pwdUser?.nombre}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="pwd1">Nueva contraseña</Label>
              <Input
                id="pwd1"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={pwd1}
                onChange={(e) => setPwd1(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pwd2">Confirmar contraseña</Label>
              <Input
                id="pwd2"
                type="password"
                placeholder="Repetir contraseña"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitPwdChange} disabled={pwdSaving}>
              {pwdSaving ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
