import type { CSSProperties } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { CATEGORY_LABELS, label, SEASON_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { CATEGORY_ORDER } from "./palette";

const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;

interface Row {
  season: string;
  category: string;
  revenue: number;
}

/** Matriz categoría × temporada. El valor se escribe en cada celda: el color es solo un refuerzo. */
export function CategorySeasonHeatmap({ data }: { data: Row[] }) {
  const max = Math.max(1, ...data.map((r) => r.revenue));
  const value = (category: string, season: string) =>
    data.find((r) => r.category === category && r.season === season)?.revenue ?? 0;

  return (
    <Table>
      <TableCaption>
        Ingresos en USD por categoría y temporada. Más intenso = más ventas.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Categoría</TableHead>
          {SEASONS.map((s) => (
            <TableHead key={s} scope="col" className="text-right">
              {label(SEASON_LABELS, s)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {CATEGORY_ORDER.map((category) => (
          <TableRow key={category}>
            <TableHead scope="row">{label(CATEGORY_LABELS, category)}</TableHead>
            {SEASONS.map((season) => {
              const v = value(category, season);
              const intensity = Math.round((v / max) * 85);
              return (
                <TableCell
                  key={season}
                  className={cn(
                    "bg-[color-mix(in_oklch,var(--chart-4)_var(--intensity),transparent)] text-right tabular-nums",
                    intensity > 62 && "text-primary-foreground",
                  )}
                  style={{ "--intensity": `${intensity}%` } as CSSProperties}
                >
                  {formatCurrency(v)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
