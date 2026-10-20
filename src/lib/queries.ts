import { queryOptions } from "@tanstack/react-query";
import { api, unwrap } from "./api";
import type { Filters } from "./filters";

// Los datos solo cambian cuando corre el ETL: se pueden reutilizar por un buen rato.
const ANALYTICS_STALE = 5 * 60_000;

export type RankingMetric = "revenue" | "orders" | "rating";

export interface PurchaseSearch extends Filters {
  page: number;
  pageSize: number;
  sort: string;
  q?: string;
}

/** Fábrica de query keys: los filtros forman parte de la key, así cada combinación se cachea. */
export const qk = {
  filterOptions: () => ["filter-options"] as const,
  kpis: (f: Filters) => ["kpis", f] as const,
  salesByCategory: (f: Filters) => ["sales", "by-category", f] as const,
  salesBySeason: (f: Filters) => ["sales", "by-season", f] as const,
  ranking: (f: Filters, metric: RankingMetric, limit: number) =>
    ["products", "ranking", f, metric, limit] as const,
  segments: (f: Filters) => ["customers", "segments", f] as const,
  demographics: (f: Filters) => ["customers", "demographics", f] as const,
  states: (f: Filters) => ["geo", "states", f] as const,
  purchases: (s: PurchaseSearch) => ["purchases", s] as const,
  etlRuns: () => ["etl", "runs"] as const,
};

const analytics = <T>(key: readonly unknown[], fn: () => Promise<T>) =>
  queryOptions({ queryKey: key, queryFn: fn, staleTime: ANALYTICS_STALE });

export const filterOptionsQuery = () =>
  queryOptions({
    queryKey: qk.filterOptions(),
    queryFn: () => unwrap(api.GET("/api/v1/filters/options")),
    staleTime: 30 * 60_000,
  });

export const kpisQuery = (f: Filters) =>
  analytics(qk.kpis(f), () => unwrap(api.GET("/api/v1/kpis", { params: { query: f } })));

export const salesByCategoryQuery = (f: Filters) =>
  analytics(qk.salesByCategory(f), () =>
    unwrap(api.GET("/api/v1/sales/by-category", { params: { query: f } })),
  );

export const salesBySeasonQuery = (f: Filters) =>
  analytics(qk.salesBySeason(f), () =>
    unwrap(api.GET("/api/v1/sales/by-season", { params: { query: f } })),
  );

export const rankingQuery = (f: Filters, metric: RankingMetric, limit = 10) =>
  analytics(qk.ranking(f, metric, limit), () =>
    unwrap(api.GET("/api/v1/products/ranking", { params: { query: { ...f, metric, limit } } })),
  );

export const segmentsQuery = (f: Filters) =>
  analytics(qk.segments(f), () =>
    unwrap(api.GET("/api/v1/customers/segments", { params: { query: f } })),
  );

export const demographicsQuery = (f: Filters) =>
  analytics(qk.demographics(f), () =>
    unwrap(api.GET("/api/v1/customers/demographics", { params: { query: f } })),
  );

export const statesQuery = (f: Filters) =>
  analytics(qk.states(f), () => unwrap(api.GET("/api/v1/geo/states", { params: { query: f } })));

export const purchasesQuery = (s: PurchaseSearch) =>
  queryOptions({
    queryKey: qk.purchases(s),
    queryFn: () => unwrap(api.GET("/api/v1/purchases", { params: { query: s } })),
    staleTime: ANALYTICS_STALE,
    placeholderData: (previous) => previous,
  });

export const etlRunsQuery = () =>
  queryOptions({
    queryKey: qk.etlRuns(),
    queryFn: () => unwrap(api.GET("/api/v1/etl/runs", { params: { query: { limit: 10 } } })),
    staleTime: 10_000,
  });
