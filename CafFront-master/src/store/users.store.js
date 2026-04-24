import { create } from "zustand";
import { UsersService } from "@/services/users.service";

const toBackendRole = (rol) => {
  if (!rol) return rol;
  return rol.charAt(0).toUpperCase() + rol.slice(1);
};

export const useUsersStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await UsersService.list();
      set({ users });
    } catch (e) {
      set({ error: e.message, users: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createUser: async ({ nombre, rol, contraseña }) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        username: nombre,
        role: toBackendRole(rol),
        password: contraseña,
      };
      await UsersService.create(payload);
      // if (data?.userId) {
      //   set({ users: [data, ...get().users] });
      // } else {
      //   const list = await UsersService.list();
      //   set({ users: list });
      // }
      return true;
    } catch (e) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (id, { nombre, rol }) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        username: nombre,
        role: toBackendRole(rol),
      };
      const { data } = await UsersService.update(id, payload);

      set({
        users: get().users.map((u) =>
          u.userId === Number(id)
            ? { ...u, username: payload.username, role: payload.role }
            : u
        ),
      });

      return true;
    } catch (e) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  removeUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { message } = await UsersService.remove(id);
      set({ users: get().users.filter((u) => u.userId !== Number(id)) });
      return message;
    } catch (e) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserById: async (id) => {
    const local = get().users.find((u) => u.userId === Number(id));
    if (local) return local;
    return await UsersService.getById(id);
  },

  changeUserPassword: async ({ nombre, rol }, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await UsersService.changePassword({
        username: nombre,
        role: toBackendRole(rol),
        newPassword,
      });
      return true;
    } catch (e) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));
