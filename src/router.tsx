import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { NotFound } from "@/components/common/not-found";
import { RouteError } from "@/components/common/route-error";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { routeTree } from "./routeTree.gen";

function notifyError(error: unknown) {
  // Solo en el navegador: en SSR el error lo muestra el errorComponent de la ruta.
  if (typeof window === "undefined") return;
  toast.add({
    type: "error",
    title:
      error instanceof ApiError && error.status === 429
        ? "Demasiadas solicitudes"
        : "No se pudieron cargar los datos",
    description: error instanceof Error ? error.message : String(error),
  });
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (count, error) =>
          count < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      // Los errores de refetch en segundo plano (con datos ya en pantalla) se avisan con un toast.
      onError: (error, query) => {
        if (query.state.data !== undefined) notifyError(error);
      },
    }),
    mutationCache: new MutationCache({ onError: notifyError }),
  });

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    // TanStack Query maneja la caché: el router no debe considerar viejos los datos precargados.
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: RouteError,
    defaultNotFoundComponent: NotFound,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
  interface StaticDataRouteOption {
    title?: string;
    description?: string;
    /** La vista no usa los filtros globales (p. ej. Calidad de datos). */
    hideFilters?: boolean;
  }
}
