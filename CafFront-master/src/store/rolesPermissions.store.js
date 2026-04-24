// src/store/rolesPermissions.store.js
import { create } from "zustand";
import { RolesPermissionsService as api } from "@/services/rolesPermissions.service";

const LS_ROLE_COLORS_KEY = "role-colors-v1";

// Paleta fija (clases válidas de Tailwind/shadcn)
export const ROLE_COLOR_PALETTE = {
  blue:   { badge: "bg-blue-100 text-blue-800",   dot: "bg-blue-500" },
  purple: { badge: "bg-purple-100 text-purple-800", dot: "bg-purple-500" },
  green:  { badge: "bg-green-100 text-green-800", dot: "bg-green-500" },
  red:    { badge: "bg-red-100 text-red-800",     dot: "bg-red-500" },
  orange: { badge: "bg-orange-100 text-orange-800", dot: "bg-orange-500" },
  gray:   { badge: "bg-gray-200 text-gray-800",   dot: "bg-gray-500" },
};

export const ROLE_COLOR_OPTIONS = [
  { key: "blue",   label: "Azul" },
  { key: "purple", label: "Violeta" },
  { key: "green",  label: "Verde" },
  { key: "red",    label: "Rojo" },
  { key: "orange", label: "Naranja" },
  { key: "gray",   label: "Gris" },
];

// carga inicial desde localStorage
function loadRoleColors() {
  try {
    return JSON.parse(localStorage.getItem(LS_ROLE_COLORS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveRoleColors(map) {
  try {
    localStorage.setItem(LS_ROLE_COLORS_KEY, JSON.stringify(map || {}));
  } catch {}
}

// Metadata para nombres/categorías/descr. (mantiene el look & feel del UI)
export const PERMISSION_META = {
  // Prendas
  "Prenda.Crear": {
    id: "Prenda.Crear",
    name: "Crear Prendas",
    category: "Prendas",
    description: "Dar de alta nuevas prendas",
  },
  "Prenda.Editar": {
    id: "Prenda.Editar",
    name: "Editar Prendas",
    category: "Prendas",
    description: "Modificar prendas existentes",
  },
  "Prenda.Eliminar": {
    id: "Prenda.Eliminar",
    name: "Eliminar Prendas",
    category: "Prendas",
    description: "Eliminar prendas del sistema",
  },
  // Muestras
  "Muestra.Crear": {
    id: "Muestra.Crear",
    name: "Crear Muestras",
    category: "Muestras",
    description: "Dar de alta nuevas muestras",
  },
  "Muestra.Editar": {
    id: "Muestra.Editar",
    name: "Editar Muestras",
    category: "Muestras",
    description: "Modificar muestras existentes",
  },
  "Muestra.Eliminar": {
    id: "Muestra.Eliminar",
    name: "Eliminar Muestras",
    category: "Muestras",
    description: "Eliminar muestras del sistema",
  },
  // Clientes
  "Clientes.Crear": {
    id: "Clientes.Crear",
    name: "Crear Clientes",
    category: "Clientes",
    description: "Dar de alta nuevos clientes",
  },
  "Clientes.Editar": {
    id: "Clientes.Editar",
    name: "Editar Clientes",
    category: "Clientes",
    description: "Modificar clientes existentes",
  },
  "Clientes.Eliminar": {
    id: "Clientes.Eliminar",
    name: "Eliminar Clientes",
    category: "Clientes",
    description: "Eliminar clientes del sistema",
  },
    // Procesos
  "Proceso.Crear": {
    id: "Proceso.Crear",
    name: "Crear Procesos",
    category: "Proceso",
    description: "Dar de alta nuevos procesos",
  },
  "Proceso.Editar": {
    id: "Proceso.Editar",
    name: "Editar Procesos",
    category: "Proceso",
    description: "Modificar procesos existentes",
  },
  "Proceso.Eliminar": {
    id: "Proceso.Eliminar",
    name: "Eliminar Procesos",
    category: "Proceso",
    description: "Eliminar procesos del sistema",
  },
  // Usuarios
  "Usuarios.Listado": {
    id: "Usuarios.Listado",
    name: "Ver Usuarios",
    category: "Usuarios",
    description: "Ver listado de usuarios",
  },
  "Usuarios.Crear": {
    id: "Usuarios.Crear",
    name: "Crear Usuarios",
    category: "Usuarios",
    description: "Dar de alta nuevos usuarios",
  },
  "Usuarios.Editar": {
    id: "Usuarios.Editar",
    name: "Editar Usuarios",
    category: "Usuarios",
    description: "Modificar usuarios existentes",
  },
  "Usuarios.Eliminar": {
    id: "Usuarios.Eliminar",
    name: "Eliminar Usuarios",
    category: "Usuarios",
    description: "Eliminar usuarios del sistema",
  },
};

// Helper: convierte catálogo en lista UI agrupable
function buildPermissionsUI(catalog /* string[] */) {
  const items = catalog.map((code) => PERMISSION_META[code]).filter(Boolean);
  const byCategory = items.reduce((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});
  return { items, byCategory };
}

export const useRolesPermissionsStore = create((set, get) => ({
  loading: false,
  roles: [], // [{ id, name, description, isSystem, permissions: [code,...] }]
  selectedRoleId: null,
  permissionsCatalog: [], // ["Prenda.Crear", ...]
  permissionsUI: { items: [], byCategory: {} },

  fetchRolesOnly: async () => {
    set({ loading: true });
    try {
      const { data: rolesRaw } = await api.list();
      // ⬇️ NO filtramos Administrador ni esSistema
      const roles = (rolesRaw ?? []).map((r) => ({
        id: r.rolID,
        name: r.nombre,
        description: r.descripcion ?? "",
        isSystem: !!r.esSistema,
        permissions: r.permissions ?? [],
        // Omitimos permissions para evitar N requests
      }));
      set({ roles });
    } finally {
      set({ loading: false });
    }
  },

  // ---------- Init / Load ----------
  init: async () => {
    set({ loading: true });
    try {
      // ⬅️ usar nombres reales del service y desestructurar {data}
      const [{ data: rolesRaw }, { data: catalog }] = await Promise.all([
        api.list(),
        api.listPermissionsCatalog(),
      ]);

      const rolesSinAdmin = (rolesRaw ?? []).filter(
        (r) =>
          !r.esSistema && String(r.nombre).toLowerCase() !== "administrador"
      );

      const roles = await Promise.all(
        rolesSinAdmin.map(async (r) => {
          const { data: perms } = await api.getRolePermissions(r.rolID);
          return {
            id: r.rolID,
            name: r.nombre,
            description: r.descripcion ?? "",
            isSystem: !!r.esSistema,
            permissions: perms ?? [],
          };
        })
      );

      const ui = buildPermissionsUI(catalog ?? []);
      const firstId = roles.length ? roles[0].id : null;

      set({
        roles,
        permissionsCatalog: catalog ?? [],
        permissionsUI: ui,
        selectedRoleId: firstId,
      });
    } finally {
      set({ loading: false });
    }
  },

  // ---------- Select ----------
  selectedRole: () => {
    const { roles, selectedRoleId } = get();
    return roles.find((r) => r.id === selectedRoleId) || null;
  },
  setSelectedRoleId: (id) => set({ selectedRoleId: id }),

  // ---------- Mutations ----------
  createRole: async ({ name, description }) => {
    const { data, message } = await api.create({
      nombre: name,
      descripcion: description || null,
    });
    const newId = data?.id;
    const newRole = {
      id: newId,
      name,
      description: description || "",
      isSystem: false,
      permissions: [],
    };
    set({ roles: [...get().roles, newRole] });
    if (!get().selectedRoleId) set({ selectedRoleId: newId });
    return { id: newId, message };
  },

  updateRole: async (id, { name, description }) => {
    const { message } = await api.update(id, {
      nombre: name,
      descripcion: description || null,
    });
    set({
      roles: get().roles.map((r) =>
        r.id === id ? { ...r, name, description: description || "" } : r
      ),
    });
    return message || "Rol actualizado.";
  },

  deleteRole: async (id) => {
    const { message } = await api.remove(id);
    const next = get().roles.filter((r) => r.id !== id);
    const wasSelected = get().selectedRoleId === id;
    set({
      roles: next,
      selectedRoleId: wasSelected ? next[0]?.id ?? null : get().selectedRoleId,
    });
    return message || "Rol eliminado correctamente.";
  },

  // Toggle asignación de permiso
  togglePermission: async (roleId, code) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return;

    const has = role.permissions.includes(code);
    if (has) {
      await api.revokeRolePermission(roleId, code);
      role.permissions = role.permissions.filter((c) => c !== code);
    } else {
      await api.assignRolePermissions(roleId, [code]);
      role.permissions = [...role.permissions, code];
    }
    set({ roles: get().roles.map((r) => (r.id === roleId ? { ...role } : r)) });
  },

   roleColors: loadRoleColors(), // { [roleNameLower]: "blue" | "green" ... }

  getRoleColor: (roleName /* string */) => {
    const key = String(roleName || "").trim().toLowerCase();
    return get().roleColors[key] || "blue"; // azul por defecto
  },

  setRoleColor: (roleName /* string */, colorKey /* string */) => {
    const key = String(roleName || "").trim().toLowerCase();
    const next = { ...get().roleColors, [key]: colorKey };
    saveRoleColors(next);
    set({ roleColors: next });
  },

  renameRoleColorKey: (oldName, newName) => {
    const src = String(oldName || "").trim().toLowerCase();
    const dst = String(newName || "").trim().toLowerCase();
    if (!src || !dst || src === dst) return;
    const map = { ...get().roleColors };
    if (map[src] && !map[dst]) {
      map[dst] = map[src];
    }
    delete map[src];
    saveRoleColors(map);
    set({ roleColors: map });
  },
}));
