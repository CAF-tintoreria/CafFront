import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Building2,
  Plus,
  List,
  Palette,
  Users2,
  UserPlus,
  KeyRound,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  FilePen
} from "lucide-react";
import { useSamplesStore } from "@/store/samples.store";
import { useEffect } from "react";
import { useClientsStore } from "@/store/client.store";
import { useGarmentsStore } from "@/store/garments.store";
import { useAuthStore } from "@/store/auth.store";
import { Activity } from "lucide-react";

const categories = {
  prendas: "Gestión de prendas",
  muestras: "Gestión de muestras",
  clientes: "Gestión de clientes",
  sistema: "Sistema",
};

const dashboardItems = [
  {
    id: "listado-prendas",
    title: "Listado de prendas",
    description: "Ver y gestionar todas las prendas",
    icon: <List className="h-6 w-6" />,
    color: "bg-blue-500 hover:bg-blue-600",
    category: "prendas",
    to: "/prendas",
  },
  {
    id: "alta-prenda",
    title: "Alta de prenda",
    description: "Registrar nueva prenda",
    icon: <Plus className="h-6 w-6" />,
    color: "bg-green-500 hover:bg-green-600",
    category: "prendas",
    to: "/prendas/crear",
  },
  {
    id: "listado-muestras",
    title: "Listado de muestras",
    description: "Ver y gestionar todas las muestras",
    icon: <Sparkles className="h-6 w-6" />,
    color: "bg-purple-500 hover:bg-purple-600",
    category: "muestras",
    to: "/muestras",
  },
  {
    id: "alta-muestra",
    title: "Alta de muestra",
    description: "Registrar nueva muestra",
    icon: <Palette className="h-6 w-6" />,
    color: "bg-indigo-500 hover:bg-indigo-600",
    category: "muestras",
    to: "/muestras/crear",
  },
  {
    id: "clientes",
    title: "Listado de cliente",
    description: "Ver y gestionar los clientes",
    icon: <Users className="h-6 w-6" />,
    color: "bg-orange-500 hover:bg-orange-600",
    category: "clientes",
    to: "/clientes",
  },
  {
    id: "alta-cliente",
    title: "Alta de cliente",
    description: "Registrar nuevo cliente",
    icon: <UserPlus className="h-6 w-6" />,
    color: "bg-orange-500 hover:bg-orange-600",
    category: "clientes",
    to: "/clientes/crear",
  },
  {
    id: "gestion-usuarios",
    title: "Gestión de usuarios",
    description: "Administrar usuarios del sistema",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-red-500 hover:bg-red-600",
    category: "sistema",
    to: "/usuarios",
  },
  {
    id: "roles-permisos",
    title: "Roles y permisos",
    description: "Gestionar roles y permisos del sistema",
    icon: <Shield className="h-5 w-5" />,
    color: "bg-pink-500 hover:bg-pink-600",
    category: "sistema",
    to: "/roles-permisos",
  },
  {
    id: "audit",
    title: "Auditoria",
    description: "Reportes de las acciones realizadas por usuarios",
    icon: <Activity className="h-5 w-5" />,
    color: "bg-purple-500 hover:bg-purple-600",
    category: "sistema",
    to: "/audit",
  },
  // {
  //   id: "cambiar-contraseña",
  //   title: "Cambiar Contraseña",
  //   description: "Actualizar tu contraseña",
  //   icon: <KeyRound className="h-6 w-6" />,
  //   color: "bg-gray-500 hover:bg-gray-600",
  //   category: "sistema",
  //   to: "/change-password",
  // },
  {
    id: "gestion-procesos",
    title: "Gestión de procesos",
    description: "Administrador los procesos de las prendas",
    icon: <FilePen className="h-6 w-6" />,
    color: "bg-blue-500 hover:bg-blue-600",
    to: "/procesos",
    category: "sistema",
  },
  {
    id: "cerrar-sesion",
    title: "Cerrar Sesión",
    description: "Salir del sistema",
    icon: <LogOut className="h-6 w-6" />,
    color: "bg-slate-500 hover:bg-slate-600",
    category: "sistema",
  },
];

export default function Dashboard({ userName = "Usuario", onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const rol = useAuthStore((s) => s.rol);
  const permisos = useAuthStore((s) => s.permisos);
  const hasPerm = (code) =>
    rol === "Administrador" || (permisos ?? []).includes(code);
  const { samples, fetchSamples } = useSamplesStore();
  const { clients, fetchClients } = useClientsStore();
  const { garments, fetchGarments } = useGarmentsStore();
  const prendasEnProceso = garments.filter(
    (g) => g.estadoPrendaID === 4
  ).length;

  useEffect(() => {
    fetchClients();
    fetchGarments();
    fetchSamples();
  }, []);

  const handleItemClick = (item) => {
    if (item.id === "cerrar-sesion") {
      setIsMobileMenuOpen(false);
      onLogout?.();
      return;
    }
    if (item.to) navigate({ to: item.to });
    setIsMobileMenuOpen(false);
  };

  // ⬇️ filtrar tarjetas visibles según permisos
  const visibleItems = dashboardItems.filter((it) => {
    switch (it.id) {
      case "gestion-usuarios":
        return hasPerm("Usuarios.Listado");
      case "roles-permisos":
        return rol === "Administrador";
      case "audit":
        return rol === "Administrador";
      case "alta-prenda":
        return hasPerm("Prenda.Crear");
      case "alta-muestra":
        return hasPerm("Muestra.Crear");
      case "alta-cliente":
        return hasPerm("Clientes.Crear");
      default:
        return true; // el resto visibles por ahora
    }
  });

  const groupedItems = visibleItems.reduce((acc, it) => {
    (acc[it.category] ||= []).push(it);
    return acc;
  }, {});

  const DashboardContent = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Panel de control</h1>
        <p className="text-gray-600">Bienvenido, {userName}</p>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent
              className="p-4 cursor-pointer"
              onClick={() =>
                navigate({
                  to: "/prendas",
                })
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Prendas activas</p>
                  <p className="text-2xl font-bold">{garments.filter(g => g.estadoPrendaID !== 2).length || "-"}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent
              className="p-4 cursor-pointer"
              onClick={() =>
                navigate({
                  to: "/muestras",
                })
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Muestras</p>
                  <p className="text-2xl font-bold">{samples.filter(s => s.status?.sampleStatusID !== 5).length || "-"}</p>
                </div>
                <Sparkles className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent
              className="p-4 cursor-pointer"
              onClick={() =>
                navigate({
                  to: "/clientes",
                })
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Clientes</p>
                  <p className="text-2xl font-bold">{clients.length || "-"}</p>
                </div>
                <Users2 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent
              className="p-4 cursor-pointer"
              onClick={() =>
                navigate({
                  to: "/prendas",
                  state: {
                    state: "4",
                  },
                })
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">En proceso</p>
                  <p className="text-2xl font-bold">{prendasEnProceso}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grillas por categoría */}
      {Object.entries(groupedItems).map(([category, items]) =>
        items.length ? (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              {categories[category]}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => {
                const CardInner = (
                  <Card
                    key={item.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 shadow-md"
                    onClick={() => handleItemClick(item)}
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center text-white mb-3`}
                      >
                        {item.icon}
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-gray-600">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );

                // Si tiene ruta, lo envolvemos en Link; si es logout, queda como Card clickeable
                return item.to ? (
                  <Link key={item.id} to={item.to} className="block">
                    {CardInner}
                  </Link>
                ) : (
                  CardInner
                );
              })}
            </div>
          </div>
        ) : null
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-80 p-0">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menú</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">
                    {categories[category]}
                  </h3>

                  <div className="space-y-2">
                    {items.map((item) => {
                      const Btn = (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleItemClick(item)}
                        >
                          <div
                            className={`w-8 h-8 rounded ${item.color} flex items-center justify-center text-white mr-3`}
                          >
                            {React.cloneElement(item.icon, {
                              className: "h-4 w-4",
                            })}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.description}
                            </div>
                          </div>
                        </Button>
                      );

                      return item.to ? (
                        <Link key={item.id} to={item.to} className="block">
                          {Btn}
                        </Link>
                      ) : (
                        Btn
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-8">
          <DashboardContent />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden p-4">
        <DashboardContent />
      </div>
    </div>
  );
}
