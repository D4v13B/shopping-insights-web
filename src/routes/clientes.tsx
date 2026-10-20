import { IconAlertCircle } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DemographicsChart } from "@/components/charts/demographics-chart";
import { SegmentsChart } from "@/components/charts/segments-chart";
import { NoResults } from "@/components/common/empty-state";
import { SectionCard, SectionCardSkeleton } from "@/components/common/section-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFilters } from "@/hooks/use-filters";
import { pickFilters } from "@/lib/filters";
import { formatCurrency, formatInteger, formatPercent, formatRating } from "@/lib/format";
import { GENDER_LABELS, label } from "@/lib/labels";
import { demographicsQuery, segmentsQuery } from "@/lib/queries";

const SEGMENT_RULES: Record<string, string> = {
  Campeones: "Valor anual alto y muchas compras previas",
  Leales: "Muchas compras previas, gasto moderado",
  "En riesgo": "Historial relevante pero compra anual o trimestral",
  Potenciales: "Valor anual alto con poco historial",
  Ocasionales: "El resto",
};

export const Route = createFileRoute("/clientes")({
  staticData: { title: "Clientes", description: "Segmentación, demografía y suscripción" },
  head: () => ({ meta: [{ title: "Clientes · Shopping Insights" }] }),
  loaderDeps: ({ search }) => pickFilters(search),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(segmentsQuery(deps)),
      queryClient.ensureQueryData(demographicsQuery(deps)),
    ]),
  pendingComponent: () => (
    <div className="grid gap-4 xl:grid-cols-2">
      <SectionCardSkeleton />
      <SectionCardSkeleton />
      <SectionCardSkeleton className="xl:col-span-2" height="h-40" />
    </div>
  ),
  component: Customers,
});

function Customers() {
  const { filters } = useFilters();
  const { data: segments } = useSuspenseQuery(segmentsQuery(filters));
  const { data: demographics } = useSuspenseQuery(demographicsQuery(filters));

  if (segments.length === 0) return <NoResults />;

  return (
    <>
      <Alert>
        <IconAlertCircle />
        <AlertTitle>Sesgo del dataset: ninguna mujer está suscrita ni usó promociones</AlertTitle>
        <AlertDescription>
          Todos los suscritos son hombres, todos los suscritos usaron promoción y hay el doble de
          hombres que de mujeres. Las comparaciones por género, suscripción y promoción reflejan
          cómo se generó el dataset (es sintético), no necesariamente un comportamiento real.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Segmentos de clientes"
          description="Reglas por terciles de valor anual estimado y compras previas"
        >
          <div className="flex flex-col gap-4">
            <SegmentsChart data={segments} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segmento</TableHead>
                  <TableHead className="text-right">Clientes</TableHead>
                  <TableHead className="text-right">Ticket</TableHead>
                  <TableHead className="text-right">Valor anual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segments.map((s) => (
                  <TableRow key={s.segment}>
                    <TableCell className="whitespace-normal">
                      <div className="flex flex-col">
                        <span className="font-medium">{s.segment}</span>
                        <span className="text-muted-foreground">{SEGMENT_RULES[s.segment]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatInteger(s.customers)}{" "}
                      <Badge variant="secondary">{formatPercent(s.sharePct)}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(s.avgTicket)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(s.avgAnnualValue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        <SectionCard title="Edad × género" description="Clientes por rango de edad y género">
          <DemographicsChart data={demographics.matrix} />
        </SectionCard>

        <SectionCard
          className="xl:col-span-2"
          title="Suscritos vs. no suscritos"
          description="Comparación por género (en términos absolutos y de ticket promedio)"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suscripción</TableHead>
                <TableHead>Género</TableHead>
                <TableHead className="text-right">Clientes</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Ticket promedio</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demographics.subscription.map((r) => (
                <TableRow key={`${r.subscribed}-${r.gender}`}>
                  <TableCell>
                    <Badge variant={r.subscribed ? "default" : "outline"}>
                      {r.subscribed ? "Suscrito" : "No suscrito"}
                    </Badge>
                  </TableCell>
                  <TableCell>{label(GENDER_LABELS, r.gender)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatInteger(r.customers)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(r.revenue)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(r.avgTicket)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRating(r.avgRating)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>
    </>
  );
}
