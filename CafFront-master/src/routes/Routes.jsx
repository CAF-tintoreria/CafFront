// src/routes.jsx
import React, { useEffect } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  useParams,
  useRouter,
  useSearch,
  redirect,
} from "@tanstack/react-router";

import Dashboard from "@/views/Dashboard";
import Login from "@/views/Login";
import UsersTable from "@/views/Users/UsersTable";
import CreateUser from "@/views/Users/CreateUser";
import EditUser from "@/views/Users/EditUser";
import GarmentsTable from "@/views/Garments/GarmentsTable";
import CreateGargament from "@/views/Garments/CreateGargament";
import EditGarment from "@/views/Garments/EditGargament";
import SamplesTable from "@/views/Samples/SamplesTable";
import EditSample from "@/views/Samples/EditSample";
import CreateClient from "@/views/Clients/CreateClient";

import { useAuthStore } from "@/store/auth.store";
import ClientsTable from "@/views/Clients/ClientsTable";
import EditClient from "@/views/Clients/EditClient";
import RolesPermissions from "@/views/RolesPermissions";
import CreateSample from "@/views/Samples/CreateSample";
import AuditTable from "@/views/Audit/Audit";
import { ProcessTable } from "@/views/Process/ProcessTable";
import { CreateProcess } from "@/views/Process/CreateProcess";

const requireAdmin = ({ location }) => {
  const { rol } = useAuthStore.getState();
  if (rol !== "Administrador") {
    throw redirect({ to: "/" });
  }
};

// ---- Guard genérico ----
const requireAuth = ({ location }) => {
  const isAuth = useAuthStore.getState().isAuthenticated();
  if (!isAuth) {
    const hasSearch =
      location.search && Object.keys(location.search).length > 0;
    const qs = hasSearch
      ? `?${new URLSearchParams(location.search).toString()}`
      : "";
    // Redirigimos a "/" (ahí se ve el Login) y guardamos adónde quería ir
    throw redirect({
      to: "/",
      search: { redirect: `${location.pathname}${qs}` },
    });
  }
};

// ---- Root Layout ----
const Root = () => {
  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  useEffect(() => {
    hydrateAuth(); // repone el header Authorization si había token persistido
  }, [hydrateAuth]);

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
};

const rootRoute = createRootRoute({ component: Root });

// ---- Home "/" muestra Login o Dashboard según sesión ----
const Home = () => {
  const router = useRouter();
  const search = useSearch({ from: "/" }); // leemos ?redirect
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const getName = useAuthStore((s) => s.getName);
  const logout = useAuthStore((s) => s.logout);

  const onLogout = () => {
    logout(); // limpia token, axios, etc.
    router.navigate({ to: "/", replace: true }); // "/" muestra el Login
  };

  // Si entró con ?redirect y ya está logueado, mandalo ahí
  useEffect(() => {
    if (isAuthenticated && search?.redirect) {
      router.navigate({ to: search.redirect });
    }
  }, [isAuthenticated, search?.redirect, router]);

  return isAuthenticated ? (
    <Dashboard userName={getName()} onLogout={onLogout} />
  ) : (
    <Login redirect={search?.redirect} />
  );
};

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

// ---- Parent protegido: todo lo de acá adentro exige sesión ----
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: ({ location }) => requireAuth({ location }),
  component: () => <Outlet />,
});

// ---------------- RUTAS PROTEGIDAS ----------------
const usersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/usuarios",
  component: () => <UsersTable />,
});

const createUserRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/usuarios/crear",
  component: () => <CreateUser />,
});

const editUserRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/usuarios/$userId/editar",
  component: () => {
    const { userId } = useParams({ from: editUserRoute.id });
    return <EditUser userId={userId} />;
  },
});

const gargamentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/prendas",
  component: () => <GarmentsTable />,
});

const createGargamentRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/prendas/crear",
  component: () => <CreateGargament />,
});

const editGargamentRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/prendas/$prendaId/editar",
  component: () => {
    const { prendaId } = useParams({ from: editGargamentRoute.id });
    return <EditGarment prendaId={Number(prendaId)} />;
  },
});

const samplesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/muestras",
  component: () => <SamplesTable />,
});

const createSampleRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/muestras/crear",
  component: () => <CreateSample />,
});

const editSampleRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/muestras/$sampleId/editar",
  component: () => {
    const { sampleId } = useParams({ from: editSampleRoute.id });
    return <EditSample sampleId={Number(sampleId)} />;
  },
});

const createClientRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/clientes/crear",
  component: () => <CreateClient />,
});

const clientsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/clientes",
  component: () => <ClientsTable />,
});

const editClientRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/clientes/$clienteId/editar",
  component: () => {
    const { clienteId } = useParams({ from: editClientRoute.id });
    return <EditClient clientId={Number(clienteId)} />;
  },
});

const rolesPermissionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/roles-permisos",
  component: () => <RolesPermissions />,
  beforeLoad: requireAdmin,
});

const auditRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/audit",
  component: () => <AuditTable />,
  beforeLoad: requireAdmin,
});

const processRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/procesos",
  component: () => <ProcessTable />,
  // beforeLoad: requireAdmin,
});
const processCreateRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/procesos/crear",
  component: () => <CreateProcess />,
});

// ---- 404 pública ----
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/*",
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="text-muted-foreground mt-2">
        La ruta no existe. Volvé al{" "}
        <Link to="/" className="underline">
          inicio
        </Link>
        .
      </p>
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  protectedRoute.addChildren([
    usersRoute,
    createUserRoute,
    editUserRoute,
    gargamentsRoute,
    createGargamentRoute,
    editGargamentRoute,
    samplesRoute,
    createSampleRoute,
    editSampleRoute,
    createClientRoute,
    clientsRoute,
    editClientRoute,
    rolesPermissionsRoute,
    auditRoute,
    processRoute,
    processCreateRoute,
  ]),
  notFoundRoute,
]);

export const router = createRouter({ routeTree });
