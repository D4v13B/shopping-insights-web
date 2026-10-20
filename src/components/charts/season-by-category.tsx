import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import { label, SEASON_LABELS } from "@/lib/labels";
import { CATEGORY_ORDER, categoryChartConfig } from "./palette";
import { ValueTooltip } from "./value-tooltip";

interface Row {
  season: string;
  category: string;
  revenue: number;
}

/** Pivota filas (temporada, categoría) a una fila por temporada con una columna por categoría. */
export function pivotBySeason(data: Row[]) {
  const seasons = [...new Set(data.map((r) => r.season))];
  return seasons.map((season) => {
    const row: Record<string, string | number> = { season: label(SEASON_LABELS, season) };
    for (const category of CATEGORY_ORDER) {
      row[category] =
        data.find((r) => r.season === season && r.category === category)?.revenue ?? 0;
    }
    return row;
  });
}

export function SeasonByCategoryChart({ data }: { data: Row[] }) {
  const rows = pivotBySeason(data);
  const present = CATEGORY_ORDER.filter((c) => data.some((r) => r.category === c));
  return (
    <ChartContainer
      config={categoryChartConfig}
      className="aspect-auto h-72 w-full"
      role="img"
      aria-label="Ingresos por temporada, agrupados por categoría"
    >
      <BarChart accessibilityLayer data={rows}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="season" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => formatCurrencyCompact(v)}
        />
        <ChartTooltip content={<ValueTooltip format={formatCurrency} />} />
        <ChartLegend content={<ChartLegendContent />} />
        {present.map((category) => (
          <Bar
            key={category}
            dataKey={category}
            fill={`var(--color-${category})`}
            radius={3}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
