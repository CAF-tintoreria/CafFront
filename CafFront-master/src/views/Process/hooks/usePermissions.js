import { useAuthStore } from "@/store/auth.store";

export function usePermissions() {
  const canDelete = useAuthStore((s) => s.hasPermission("Proceso.Eliminar"));
  const canCreate = useAuthStore((s) => s.hasPermission("Proceso.Crear"));
  const canEdit = useAuthStore((s) => s.hasPermission("Proceso.Editar"));
  const rolActual = useAuthStore((s) => s.rol);

  return {
    canDelete,
    canCreate,
    canEdit,
    isAdmin: rolActual === "Administrador",
  };
}
