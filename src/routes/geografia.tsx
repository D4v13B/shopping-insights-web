import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UsChoropleth } from "@/components/charts/us-choropleth";
import { NoResults } from "@/components/common/empty-state";
import { SectionCard, SectionCardSkeleton } from "@/components/common/section-card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFilters } from "@/hooks/use-filters";
import { pickFilters } from "@/lib/filters";
import { formatCurrency, formatInteger, formatPercent } from "@/lib/format";
import { regionTotals } from "@/lib/geo";
import { label, REGION_LABELS } from "@/lib/labels";
import { statesQuery } from "@/lib/queries";

export const Route = createFileRoute("/geografia")({
  staticData: { title: "Geografía", description: "Ventas por estado y región de EE.UU." },
  head: () => ({ meta: [{ title: "Geografía · Shopping Insights" }] }),
  loaderDeps: ({ search }) => pickFilters(search),
  loader: ({ context: { queryClient }, deps }) => queryClient.ensureQueryData(statesQuery(deps)),
  pendingComponent: () => (
    <div className="grid gap-4 xl:grid-cols-3">
      <SectionCardSkeleton className="xl:col-span-2" height="h-96" />
      <SectionCardSkeleton height="h-96" />
    </div>
  ),
  component: Geography,
});

function Geography() {
  const { filters } = useFilters();
  const { data: states } = useSuspenseQuery(statesQuery(filters));
  const regions = regionTotals(states);

  if (states.every((s) => s.orders === 0)) return <NoResults />;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <SectionCard
        className="xl:col-span-2"
        title="Mapa de ingresos"
        description="Pasa el cursor o navega con Tab por los estados para ver el detalle"
      >
        <UsChoropleth data={states} />
      </SectionCard>

      <SectionCard title="Totales por región" description="Regiones del Census de EE.UU.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Región</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead className="text-right">Órdenes</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions.map((r) => (
              <TableRow key={r.region}>
                <TableCell>{label(REGION_LABELS, r.region)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(r.revenue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatInteger(r.orders)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPercent(r.sharePct)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      <SectionCard
        className="xl:col-span-3"
        title="Ranking de estados"
        description="Los 50 estados ordenados por ingresos (alternativa en texto al mapa)"
      >
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableCaption>Ingresos, órdenes y ticket promedio por estado.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Región</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Órdenes</TableHead>
                <TableHead className="text-right">Ticket promedio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {states.map((s, i) => (
                <TableRow key={s.stateCode}>
                  <TableCell className="tabular-nums">{i + 1}</TableCell>
                  <TableCell>
                    {s.stateName} <span className="text-muted-foreground">({s.stateCode})</span>
                  </TableCell>
                  <TableCell>{label(REGION_LABELS, s.region)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(s.revenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInteger(s.orders)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(s.avgTicket)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
