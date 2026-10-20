import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconDatabase,
  IconInfoCircle,
  IconRowRemove,
} from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { KpiCard } from "@/components/common/kpi-card";
import { SectionCard, SectionCardSkeleton } from "@/components/common/section-card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EtlRun } from "@/contract";
import { formatDateTime, formatDuration, formatInteger } from "@/lib/format";
import { findingsFrom, lastSuccessful, type QualityReport } from "@/lib/quality";
import { etlRunsQuery } from "@/lib/queries";

const STATUS: Record<
  EtlRun["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  success: { label: "Exitosa", variant: "default" },
  failed: { label: "Fallida", variant: "destructive" },
  running: { label: "En curso", variant: "secondary" },
  requested: { label: "Solicitada", variant: "outline" },
};

const TRIGGER: Record<EtlRun["trigger"], string> = {
  startup: "Arranque",
  cli: "CLI",
  api: "API",
};

export const Route = createFileRoute("/calidad")({
  staticData: {
    title: "Calidad de datos",
    description: "Última ejecución del ETL y hallazgos",
    hideFilters: true,
  },
  head: () => ({ meta: [{ title: "Calidad de datos · Shopping Insights" }] }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(etlRunsQuery()),
  pendingComponent: () => <SectionCardSkeleton height="h-96" />,
  component: DataQuality,
});

function DataQuality() {
  const { data: runs } = useSuspenseQuery(etlRunsQuery());
  const last = lastSuccessful(runs);

  if (!last) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Todavía no hay ejecuciones exitosas del ETL</EmptyTitle>
          <EmptyDescription>
            Ejecuta <code>docker compose up</code> o <code>shopping-etl run</code> para cargar los
            datos.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const findings = findingsFrom(last.qualityReport as QualityReport | null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Última carga"
          value={last.finishedAt ? formatDateTime(last.finishedAt) : "—"}
          hint={`Fuente: ${last.source === "kaggle" ? "Kaggle" : "CSV local"}`}
          icon={IconClock}
        />
        <KpiCard
          label="Filas válidas"
          value={formatInteger(last.rowsValid ?? 0)}
          icon={IconDatabase}
        />
        <KpiCard
          label="Filas rechazadas"
          value={formatInteger(last.rowsRejected ?? 0)}
          icon={IconRowRemove}
        />
        <KpiCard
          label="Duración"
          value={last.durationMs != null ? formatDuration(last.durationMs) : "—"}
          icon={IconCircleCheck}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Hallazgos de calidad"
          description="Generados por el ETL en cada ejecución"
        >
          <ul className="flex flex-col gap-3">
            {findings.map((f) => (
              <li key={f.id} className="flex gap-3">
                {f.severity === "warning" ? (
                  <IconAlertTriangle
                    aria-label="Advertencia"
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                  />
                ) : (
                  <IconInfoCircle
                    aria-label="Información"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{f.title}</span>
                  <span className="text-muted-foreground">{f.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Ejecuciones recientes"
          description="Para recargar los datos: POST /api/v1/etl/run desde Swagger (requiere API key)"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitada</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Filas</TableHead>
                <TableHead className="text-right">Duración</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>{formatDateTime(run.requestedAt)}</TableCell>
                  <TableCell>{TRIGGER[run.trigger]}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS[run.status].variant} title={run.error ?? undefined}>
                      {STATUS[run.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {run.rowsValid != null ? formatInteger(run.rowsValid) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {run.durationMs != null ? formatDuration(run.durationMs) : "—"}
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
