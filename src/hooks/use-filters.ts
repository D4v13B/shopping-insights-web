import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { type FilterKey, type Filters, pickFilters } from "@/lib/filters";

/**
 * Lee y escribe los filtros globales en la URL. Cambiar un filtro reinicia la paginación de
 * /compras, porque la página anterior puede no existir con el nuevo filtro.
 */
export function useFilters() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const filters = useMemo(() => pickFilters(search), [search]);

  const setFilter = useCallback(
    (key: FilterKey, value: string | undefined) => {
      void navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => ({ ...prev, [key]: value, page: undefined }),
        replace: true,
      });
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    void navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => {
        const next: Record<string, unknown> = { ...prev, page: undefined };
        for (const key of Object.keys(pickFilters(prev))) next[key] = undefined;
        return next;
      },
      replace: true,
    });
  }, [navigate]);

  return { filters, setFilter, clearFilters } satisfies {
    filters: Filters;
    setFilter: unknown;
    clearFilters: unknown;
  };
}
