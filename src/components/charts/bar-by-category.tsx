import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import { CATEGORY_LABELS, label } from "@/lib/labels";
import { ValueTooltip } from "./value-tooltip";

interface Row {
  category: string;
  revenue: number;
  orders: number;
}

const config = { revenue: { label: "Ingresos", color: "var(--chart-3)" } } satisfies ChartConfig;

export function RevenueByCategoryChart({ data }: { data: Row[] }) {
  const rows = data.map((r) => ({ ...r, name: label(CATEGORY_LABELS, r.category) }));
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-64 w-full"
      role="img"
      aria-label={`Ingresos por categoría: ${rows.map((r) => `${r.name} ${formatCurrency(r.revenue)}`).join(", ")}`}
    >
      <BarChart accessibilityLayer data={rows} layout="vertical" margin={{ left: 8, right: 56 }}>
        <CartesianGrid horizontal={false} />
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
        <XAxis type="number" hide />
        <ChartTooltip cursor={false} content={<ValueTooltip format={formatCurrency} />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} maxBarSize={56}>
          <LabelList
            dataKey="revenue"
            position="right"
            className="fill-foreground"
            formatter={(value: unknown) => formatCurrencyCompact(Number(value))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
