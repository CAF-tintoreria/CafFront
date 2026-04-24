// src/views/RolesPermissions.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/hooks/use-toast";
import {
  useRolesPermissionsStore,
  ROLE_COLOR_OPTIONS,
  ROLE_COLOR_PALETTE,
} from "@/store/rolesPermissions.store";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { showToast } from "@/lib/Toast";

export default function RolesPermissions({ onBack }) {
  // Store
  const {
    init,
    roles,
    selectedRole: getSelectedRole,
    setSelectedRoleId,
    permissionsUI,
    createRole,
    updateRole,
    deleteRole,
    togglePermission,
    getRoleColor,
    setRoleColor,
    renameRoleColorKey,
  } = useRolesPermissionsStore();

  const selectedRole = getSelectedRole();
  const permissionsByCategory = permissionsUI.byCategory;

  useEffect(() => {
    init();
  }, [init]);

  // UI State (sin cambios visuales)
  const [activeSection, setActiveSection] = useState("permissions");
  const [editingRole, setEditingRole] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDescription, setEditRoleDescription] = useState("");
  const [editRoleColor, setEditRoleColor] = useState("blue");

  const [deletingRole, setDeletingRole] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("blue");

  const navigate = useNavigate();
  const rol = useAuthStore((s) => s.rol);
  useEffect(() => {
    if (rol !== "Administrador") navigate({ to: "/" });
  }, [rol, navigate]);

  // const { toast } = useToast();

  // --- Handlers (mismos que tenías, ahora llaman al store) ---
  const handlePermissionToggle = async (permissionCode) => {
    if (!selectedRole) return;
    try {
      const wasChecked = selectedRole.permissions.includes(permissionCode);
      await togglePermission(selectedRole.id, permissionCode);
      showToast({
        title: wasChecked ? "Permiso removido" : "Permiso agregado",
      });
    } catch (e) {
      showToast({
        title: e?.message || "No se pudo actualizar el permiso",
        icon: "error",
      });
    }
  };

  const normalize = (s) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  const existsRoleName = (name, exceptId = null) =>
    roles.some(
      (r) => r.id !== exceptId && normalize(r.name) === normalize(name)
    );

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      showToast({ title: "El nombre del rol es obligatorio", icon: "error" });
      return;
    }
    if (normalize(newRoleName) === "administrador") {
      showToast({
        title: "No podés crear un rol llamado «Administrador».",
        icon: "error",
      });
      return;
    }
    // duplicado local
    if (existsRoleName(newRoleName)) {
      showToast({
        title: `El rol «${newRoleName}» ya existe. Elegí otro nombre.`,
        icon: "error",
      });
      return;
    }
    try {
      const { message } = await createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim(),
      });
      setRoleColor(newRoleName.trim(), newRoleColor);
      setIsCreateDialogOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      setNewRoleColor("blue");
      showToast({
        title: message || `Rol "${newRoleName}" creado correctamente`,
      });
    } catch (e) {
      showToast({
        title: e?.message || "No se pudo crear el rol",
        icon: "error",
      });
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditRoleDescription(role.description || "");
    setIsEditDialogOpen(true);
    setEditRoleColor(getRoleColor(role.name));
  };

  const handleSaveEditRole = async () => {
    if (!editingRole || !editRoleName.trim()) {
      showToast({ title: "El nombre del rol es obligatorio", icon: "error" });
      return;
    }
    if (normalize(editRoleName) === "administrador") {
      showToast({
        title: "No podés renombrar un rol a «Administrador».",
        icon: "error",
      });
      return;
    }
    // duplicado local (excluimos el rol que estamos editando)
    if (existsRoleName(editRoleName, editingRole.id)) {
      showToast({
        title: `Ya existe un rol llamado «${editRoleName}».`,
        icon: "error",
      });
      return;
    }
    try {
      const msg = await updateRole(editingRole.id, {
        name: editRoleName.trim(),
        description: editRoleDescription.trim(),
      });

      // Si cambió el nombre, renombramos la key del color
      if (editingRole.name !== editRoleName.trim()) {
        renameRoleColorKey(editingRole.name, editRoleName.trim());
      }
      // Y seteo el color elegido para el nombre definitivo
      setRoleColor(editRoleName.trim(), editRoleColor);
      setIsEditDialogOpen(false);
      setEditingRole(null);
      showToast({
        title: msg || `Rol "${editRoleName}" actualizado correctamente`,
      });
    } catch (e) {
      showToast({
        title: e?.message || "No se pudo actualizar el rol",
        icon: "error",
      });
    }
  };

  const handleDeleteRole = (role) => {
    setDeletingRole(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!deletingRole) return;
    try {
      const msg = await deleteRole(deletingRole.id);
      setIsDeleteDialogOpen(false);
      setDeletingRole(null);
      showToast({
        title: msg || `Rol "${deletingRole.name}" eliminado correctamente`,
      });
    } catch (e) {
      showToast({
        title: e?.message || "No se pudo eliminar el rol",
        icon: "error",
      });
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NavigateRoute path="/" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Roles y Permisos
            </h1>
            <p className="text-gray-600">
              Administra los roles y permisos del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Selector de Sección */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeSection === "permissions" ? "default" : "ghost"}
          onClick={() => setActiveSection("permissions")}
          className="rounded-b-none"
        >
          <Shield className="h-4 w-4 mr-2" />
          Asignar Permisos
        </Button>
        <Button
          variant={activeSection === "roles" ? "default" : "ghost"}
          onClick={() => setActiveSection("roles")}
          className="rounded-b-none"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Gestionar Roles
        </Button>
      </div>

      {/* Sección 1: Asignar Permisos */}
      {activeSection === "permissions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lista de Roles */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seleccionar Rol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    variant={
                      selectedRole?.id === role.id ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {role.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Permisos del Rol Seleccionado */}
          <div className="lg:col-span-9">
            {selectedRole ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {selectedRole.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedRole.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {selectedRole.permissions.length} permisos activos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(permissionsByCategory).map(
                    ([category, permissions]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {category}
                          </h3>
                          <Separator className="flex-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissions.map((permission) => {
                            const isChecked = selectedRole.permissions.includes(
                              permission.id
                            );
                            return (
                              <div
                                key={permission.id}
                                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                                  isChecked
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-white border-gray-200"
                                }`}
                              >
                                <Checkbox
                                  id={permission.id}
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    handlePermissionToggle(permission.id)
                                  }
                                />
                                <div className="flex-1 space-y-1">
                                  <label
                                    htmlFor={permission.id}
                                    className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                                  >
                                    {permission.name}
                                    {isChecked && (
                                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                    )}
                                  </label>
                                  <p className="text-xs text-gray-500">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona un rol
                  </h3>
                  <p className="text-gray-600">
                    Selecciona un rol de la lista para ver y editar sus permisos
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Sección 2: Gestionar Roles */}
      {activeSection === "roles" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestión de Roles</CardTitle>
                <CardDescription>
                  Crear, editar o eliminar roles del sistema
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Rol
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        {role.name}
                      </h3>
                      <Badge variant="secondary">
                        {role.permissions.length} permisos
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      {role.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Crear Rol */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo rol
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newRoleName">Nombre del Rol *</Label>
              <Input
                id="newRoleName"
                placeholder="Ej: Supervisor"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newRoleDescription">Descripción</Label>
              <Input
                id="newRoleDescription"
                placeholder="Ej: Supervisor de área de producción"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <select
                  value={newRoleColor}
                  onChange={(e) => setNewRoleColor(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  {ROLE_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR_PALETTE[newRoleColor].badge}`}
                >
                  {newRoleName || "Rol"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleCreateRole}>
              <Save className="h-4 w-4 mr-2" />
              Crear Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Rol */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>
              Modifica los datos del rol "{editingRole?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editRoleName">Nombre del Rol *</Label>
              <Input
                id="editRoleName"
                value={editRoleName}
                onChange={(e) => setEditRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRoleDescription">Descripción</Label>
              <Input
                id="editRoleDescription"
                value={editRoleDescription}
                onChange={(e) => setEditRoleDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <select
                  value={editRoleColor}
                  onChange={(e) => setEditRoleColor(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  {ROLE_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR_PALETTE[editRoleColor].badge}`}
                >
                  {editRoleName || "Rol"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveEditRole}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar Rol */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Rol</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el rol "{deletingRole?.name}
              "? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRole}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
