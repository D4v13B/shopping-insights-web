import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useMatches,
} from "@tanstack/react-router";
import { lazy, type ReactNode, Suspense } from "react";
import { FilterBar } from "@/components/filters/filter-bar";
import { MobileFilters } from "@/components/filters/mobile-filters";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { filtersSchema } from "@/lib/filters";
import { filterOptionsQuery } from "@/lib/queries";
import appCss from "../styles.css?url";

// Las devtools solo se cargan en desarrollo (no entran al bundle de producción).
const Devtools = import.meta.env.DEV
  ? lazy(() => import("@/components/layout/devtools").then((m) => ({ default: m.Devtools })))
  : () => null;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: filtersSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(filterOptionsQuery()),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Shopping Insights" },
      {
        name: "description",
        content: "Dashboard analítico de tendencias de compra para un retailer de moda.",
      },
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootDocument,
  component: AppLayout,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Suspense>
          <Devtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}

function AppLayout() {
  const matches = useMatches();
  const current = matches.at(-1)?.staticData;

  return (
    <TooltipProvider>
      <Toaster>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex flex-col gap-4 border-b px-4 py-4 md:px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-1 h-4" />
                <div className="flex min-w-0 flex-col">
                  <h1 className="truncate font-heading text-lg font-semibold">
                    {current?.title ?? "Shopping Insights"}
                  </h1>
                  {current?.description ? (
                    <p className="truncate text-muted-foreground">{current.description}</p>
                  ) : null}
                </div>
              </div>
              {current?.hideFilters ? null : (
                <>
                  <div className="hidden md:block">
                    <FilterBar />
                  </div>
                  <div className="md:hidden">
                    <MobileFilters />
                  </div>
                </>
              )}
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </Toaster>
    </TooltipProvider>
  );
}
