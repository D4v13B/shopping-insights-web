import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CategorySeasonHeatmap } from "@/components/charts/heatmap-table";
import { RankingChart } from "@/components/charts/ranking-chart";
import { NoResults } from "@/components/common/empty-state";
import { SectionCard, SectionCardSkeleton } from "@/components/common/section-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFilters } from "@/hooks/use-filters";
import { pickFilters } from "@/lib/filters";
import { formatCurrency, formatDecimal, formatInteger } from "@/lib/format";
import { type RankingMetric, rankingQuery, salesBySeasonQuery } from "@/lib/queries";

const METRICS: { value: RankingMetric; label: string; format: (v: number) => string }[] = [
  { value: "revenue", label: "Ingresos", format: formatCurrency },
  { value: "orders", label: "Órdenes", format: formatInteger },
  { value: "rating", label: "Rating", format: formatDecimal },
];

const searchSchema = z.object({
  metric: z.enum(["revenue", "orders", "rating"]).optional().catch(undefined),
});

export const Route = createFileRoute("/productos")({
  staticData: { title: "Productos", description: "Ranking y surtido por temporada" },
  head: () => ({ meta: [{ title: "Productos · Shopping Insights" }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    filters: pickFilters(search),
    metric: search.metric ?? "revenue",
  }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(rankingQuery(deps.filters, deps.metric)),
      queryClient.ensureQueryData(salesBySeasonQuery(deps.filters)),
    ]),
  pendingComponent: () => (
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionCardSkeleton height="h-96" />
      <SectionCardSkeleton />
    </div>
  ),
  component: Products,
});

function Products() {
  const { filters } = useFilters();
  const metric = Route.useSearch({ select: (s) => s.metric ?? "revenue" });
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: ranking } = useSuspenseQuery(rankingQuery(filters, metric));
  const { data: bySeason } = useSuspenseQuery(salesBySeasonQuery(filters));
  const current = METRICS.find((m) => m.value === metric) ?? METRICS[0];

  if (ranking.length === 0) return <NoResults />;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionCard
        title="Top 10 productos"
        description={`Ordenados por ${current.label.toLowerCase()}`}
        action={
          <ToggleGroup
            aria-label="Métrica del ranking"
            variant="outline"
            size="sm"
            value={[metric]}
            onValueChange={(value) => {
              const next = value[0] as RankingMetric | undefined;
              if (next)
                void navigate({ search: (prev) => ({ ...prev, metric: next }), replace: true });
            }}
          >
            {METRICS.map((m) => (
              <ToggleGroupItem key={m.value} value={m.value}>
                {m.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      >
        <RankingChart data={ranking} metric={metric} format={current.format} />
      </SectionCard>
      <SectionCard
        title="Categoría × temporada"
        description="Dónde se concentra la venta de cada categoría a lo largo del año"
      >
        <CategorySeasonHeatmap data={bySeason} />
      </SectionCard>
    </div>
  );
}
