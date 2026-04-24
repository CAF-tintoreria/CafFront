// src/services/rolesPermissions.service.js
import { api } from "@/lib/axios";

const unwrap = (res) => {
  const { ok, data, message } = res.data ?? {};
  if (ok === false) throw new Error(message || "Operación no realizada");
  return { data, message };
};

const throwFromAxios = (e) => {
  const msg = e?.response?.data?.message || e?.message || "Error de red";
  throw new Error(msg);
};

export const RolesPermissionsService = {
  // ---- Roles ----
  async list() {
    try {
      const res = await api.get("/roles");
      return unwrap(res);
    } catch (e) {
      throwFromAxios(e);
    }
  },

  async create({ nombre, descripcion }) {
    try {
      const res = await api.post("/roles", { nombre, descripcion });
      const { ok, id, message } = res.data ?? {};
      if (ok === false) throw new Error(message || "No se pudo crear el rol");
      return { data: { id }, message: message || "Rol creado." };
    } catch (e) {
      throwFromAxios(e);
    }
  },

  async update(rolId, { nombre, descripcion }) {
    try {
      const res = await api.put(`/roles/${rolId}`, { nombre, descripcion });
      return unwrap(res); // -> { message }
    } catch (e) {
      throwFromAxios(e);
    }
  },

  async remove(rolId) {
    try {
      const res = await api.delete(`/roles/${rolId}`);
      const { ok, message, data } = res?.data ?? {};
      if (ok === false) throw new Error(message || "");
      return { data, message: message || "Rol eliminado correctamente." };
    } catch (e) {
      // Aquí capturamos mensajes como:
      // "No se puede eliminar un rol que está asignado a usuarios."
      // "No se puede eliminar el rol 'Administrador'."
      throwFromAxios(e);
    }
  },

  // ---- Permisos ----
  async listPermissionsCatalog() {
    try {
      const res = await api.get("/roles/permisos");
      return unwrap(res);
    } catch (e) {
      throwFromAxios(e);
    }
  },

  async getRolePermissions(rolId) {
    try {
      const res = await api.get(`/roles/${rolId}/permisos`);
      return unwrap(res);
    } catch (e) {
      throwFromAxios(e);
    }
  },

  async assignRolePermissions(rolId, codigos) {
    try {
      const res = await api.post(`/roles/${rolId}/permisos`, {
        Codigos: codigos,
      });
      return unwrap(res);
    } catch (e) {
      throwFromAxios(e);
    }
  },

  async revokeRolePermission(rolId, codigo) {
    try {
      const res = await api.delete(
        `/roles/${rolId}/permisos/${encodeURIComponent(codigo)}`
      );
      return unwrap(res);
    } catch (e) {
      throwFromAxios(e);
    }
  },
};
