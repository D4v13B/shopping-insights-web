import {
  IconCalendarOff,
  IconCash,
  IconDiscount,
  IconReceipt,
  IconShoppingCart,
  IconStar,
  IconUserCheck,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { RevenueByCategoryChart } from "@/components/charts/bar-by-category";
import { SeasonByCategoryChart } from "@/components/charts/season-by-category";
import { NoResults } from "@/components/common/empty-state";
import { KpiCard, KpiCardSkeleton } from "@/components/common/kpi-card";
import { SectionCard, SectionCardSkeleton } from "@/components/common/section-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFilters } from "@/hooks/use-filters";
import { pickFilters } from "@/lib/filters";
import { formatCurrency, formatDecimal, formatInteger, formatPercent } from "@/lib/format";
import { kpisQuery, salesByCategoryQuery, salesBySeasonQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  staticData: { title: "Resumen", description: "Estado general del negocio" },
  head: () => ({ meta: [{ title: "Resumen · Shopping Insights" }] }),
  loaderDeps: ({ search }) => pickFilters(search),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(kpisQuery(deps)),
      queryClient.ensureQueryData(salesByCategoryQuery(deps)),
      queryClient.ensureQueryData(salesBySeasonQuery(deps)),
    ]),
  pendingComponent: OverviewSkeleton,
  component: Overview,
});

function Overview() {
  const { filters } = useFilters();
  const { data: kpis } = useSuspenseQuery(kpisQuery(filters));
  const { data: byCategory } = useSuspenseQuery(salesByCategoryQuery(filters));
  const { data: bySeason } = useSuspenseQuery(salesBySeasonQuery(filters));

  if (kpis.orders === 0) return <NoResults />;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Ingresos" value={formatCurrency(kpis.revenue)} icon={IconCash} />
        <KpiCard
          label="Órdenes"
          value={formatInteger(kpis.orders)}
          hint="= clientes: 1 compra por cliente"
          icon={IconShoppingCart}
        />
        <KpiCard
          label="Ticket promedio"
          value={formatCurrency(kpis.avgTicket)}
          icon={IconReceipt}
        />
        <KpiCard
          label="Rating promedio"
          value={`${formatDecimal(kpis.avgRating)} / 5`}
          icon={IconStar}
        />
        <KpiCard
          label="Clientes suscritos"
          value={formatPercent(kpis.subscribedPct)}
          icon={IconUserCheck}
        />
        <KpiCard
          label="Órdenes con promoción"
          value={formatPercent(kpis.promoPct)}
          icon={IconDiscount}
        />
      </div>

      <Alert>
        <IconCalendarOff />
        <AlertTitle>Este dataset no contiene fechas</AlertTitle>
        <AlertDescription>
          No hay series de tiempo: la única dimensión temporal es la temporada. Cada fila es un
          cliente con una sola compra observada, por eso órdenes y clientes coinciden.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard
          className="lg:col-span-2"
          title="Ingresos por categoría"
          description="Ventas totales en USD de cada categoría"
        >
          <RevenueByCategoryChart data={byCategory} />
        </SectionCard>
        <SectionCard
          className="lg:col-span-3"
          title="Ingresos por temporada"
          description="Comparación del surtido por temporada y categoría"
        >
          <SeasonByCategoryChart data={bySeason} />
        </SectionCard>
      </div>
    </>
  );
}

const KPI_SKELETONS = ["revenue", "orders", "ticket", "rating", "subscribed", "promo"];

function OverviewSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {KPI_SKELETONS.map((key) => (
          <KpiCardSkeleton key={key} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCardSkeleton className="lg:col-span-2" />
        <SectionCardSkeleton className="lg:col-span-3" />
      </div>
    </>
  );
}
