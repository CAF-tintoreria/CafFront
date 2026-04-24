// src/views/Users/EditUser.jsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { Link, useNavigate } from "@tanstack/react-router";
import { useUsersStore } from "@/store/users.store";
import { useRolesPermissionsStore } from "@/store/rolesPermissions.store";
import { showToast } from "@/lib/Toast";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  nombre: z
    .string()
    .trim()
    .min(4, "El nombre debe tener al menos 4 caracteres")
    .max(22, "El nombre no debe tener mas de 22 caracteres"),
  rol: z.string().trim().min(1, "Seleccioná un rol"),
});

export default function EditUser({ userId }) {
  const navigate = useNavigate();
  const { getUserById, updateUser } = useUsersStore.getState();

  const {
    roles,
    loading: loadingRoles,
    fetchRolesOnly,
  } = useRolesPermissionsStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRolesOnly();
  }, [fetchRolesOnly]);

  const roleOptions = useMemo(
    () =>
      (roles ?? [])
        .map((r) => String(r.name || "").trim())
        .filter(Boolean)
        .map((n) => n.toLowerCase())
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .sort(),
    [roles]
  );

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: { nombre: "", rol: "" },
  });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const u = await getUserById(userId);
        if (!u) {
          navigate({ to: "/usuarios", replace: true });
          return;
        }
        form.reset({
          nombre: u.username || "",
          rol: (u.role || "").toLowerCase(),
        });
      } catch {
        navigate({ to: "/usuarios", replace: true });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  const onSubmit = async (values) => {
    try {
      await updateUser(userId, {
        nombre: values.nombre.trim(),
        rol: values.rol,
      });
      showToast({ title: "Usuario actualizado correctamente" });
      navigate({ to: "/usuarios", replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? String(err);
      showToast({ title: msg, icon: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" />
              <p className="text-gray-600">Cargando datos del usuario...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <NavigateRoute path="/usuarios" />
            <div>
              <CardTitle>Editar Usuario</CardTitle>
              <CardDescription>
                Modifica los datos del usuario #{userId}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loadingRoles || roleOptions.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingRoles
                                ? "Cargando roles..."
                                : roleOptions.length
                                ? "Selecciona el rol"
                                : "No hay roles disponibles"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((rol) => (
                            <SelectItem key={rol} value={rol}>
                              {cap(rol)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex gap-4">
              <Link to="/usuarios" className="inline-flex flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
