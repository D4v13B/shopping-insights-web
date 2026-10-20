import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { RankingMetric } from "@/lib/queries";
import { ValueTooltip } from "./value-tooltip";

interface Row {
  rank: number;
  itemName: string;
  revenue: number;
  orders: number;
  avgRating: number;
}

const META: Record<RankingMetric, { key: keyof Row; label: string }> = {
  revenue: { key: "revenue", label: "Ingresos" },
  orders: { key: "orders", label: "Órdenes" },
  rating: { key: "avgRating", label: "Rating promedio" },
};

export function RankingChart({
  data,
  metric,
  format,
}: {
  data: Row[];
  metric: RankingMetric;
  format: (value: number) => string;
}) {
  const { key, label } = META[metric];
  const config = { [key]: { label, color: "var(--chart-4)" } } satisfies ChartConfig;
  const rows = data.map((r) => ({ ...r, name: `${r.rank}. ${r.itemName}` }));
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-96 w-full"
      role="img"
      aria-label={`Top ${rows.length} productos por ${label.toLowerCase()}: ${rows
        .map((r) => `${r.name} ${format(Number(r[key]))}`)
        .join(", ")}`}
    >
      <BarChart accessibilityLayer data={rows} layout="vertical" margin={{ left: 8, right: 64 }}>
        <CartesianGrid horizontal={false} />
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} />
        <XAxis type="number" hide domain={metric === "rating" ? [0, 5] : [0, "auto"]} />
        <ChartTooltip cursor={false} content={<ValueTooltip format={format} />} />
        <Bar dataKey={key} fill={`var(--color-${key})`} radius={4} maxBarSize={32}>
          <LabelList
            dataKey={key}
            position="right"
            className="fill-foreground"
            formatter={(value: unknown) => format(Number(value))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
