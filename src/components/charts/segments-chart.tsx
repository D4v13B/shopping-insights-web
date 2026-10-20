import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatInteger } from "@/lib/format";
import { CHART_VARS } from "./palette";
import { ValueTooltip } from "./value-tooltip";

interface Row {
  segment: string;
  customers: number;
}

const config = { customers: { label: "Clientes", color: "var(--chart-3)" } } satisfies ChartConfig;

export function SegmentsChart({ data }: { data: Row[] }) {
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-64 w-full"
      role="img"
      aria-label={`Clientes por segmento: ${data.map((r) => `${r.segment} ${r.customers}`).join(", ")}`}
    >
      <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="segment" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis hide />
        <ChartTooltip cursor={false} content={<ValueTooltip format={formatInteger} />} />
        <Bar dataKey="customers" radius={4} maxBarSize={72}>
          {data.map((row, i) => (
            <Cell
              key={row.segment}
              fill={CHART_VARS[CHART_VARS.length - 1 - (i % CHART_VARS.length)]}
            />
          ))}
          <LabelList
            dataKey="customers"
            position="top"
            className="fill-foreground"
            formatter={(value: unknown) => formatInteger(Number(value))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
