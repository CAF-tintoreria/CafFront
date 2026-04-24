import { useEffect, useMemo } from "react";
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
import { UserPlus } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { NavigateRoute } from "@/lib/NavigateRoute";
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

const schema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(4, "El nombre debe tener al menos 4 caracteres")
      .max(22, "El nombre no debe tener mas de 22 caracteres"),
    rol: z.string().trim().min(1, "Seleccioná un rol"),
    contraseña: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    repetirContraseña: z.string().min(1, "Repetí la contraseña"),
  })
  .refine((vals) => vals.contraseña === vals.repetirContraseña, {
    path: ["repetirContraseña"],
    message: "Las contraseñas no coinciden",
  });

export default function CreateUser() {
  const navigate = useNavigate();
  const { createUser } = useUsersStore.getState();

  const {
    roles,
    loading: loadingRoles,
    fetchRolesOnly,
  } = useRolesPermissionsStore();

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
    defaultValues: {
      nombre: "",
      rol: "",
      contraseña: "",
      repetirContraseña: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await createUser({
        nombre: values.nombre.trim(),
        rol: values.rol,
        contraseña: values.contraseña,
      });
      showToast({ title: "Usuario creado correctamente" });
      navigate({ to: "/usuarios", replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? String(err);
      showToast({ title: msg, icon: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <NavigateRoute path="/usuarios" />
            <div>
              <CardTitle>Crear Usuario</CardTitle>
              <CardDescription>
                Completa los datos para crear un nuevo usuario
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

              <FormField
                control={form.control}
                name="contraseña"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repetirContraseña"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repetir Contraseña *</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                <UserPlus className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Creando..." : "Crear Usuario"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
