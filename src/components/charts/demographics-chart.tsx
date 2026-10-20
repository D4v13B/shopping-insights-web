import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatInteger } from "@/lib/format";
import { ValueTooltip } from "./value-tooltip";

interface Row {
  ageBand: string;
  gender: string;
  customers: number;
}

const config = {
  Female: { label: "Mujer", color: "var(--chart-2)" },
  Male: { label: "Hombre", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function DemographicsChart({ data }: { data: Row[] }) {
  const bands = [...new Set(data.map((r) => r.ageBand))];
  const rows = bands.map((ageBand) => ({
    ageBand,
    Female: data.find((r) => r.ageBand === ageBand && r.gender === "Female")?.customers ?? 0,
    Male: data.find((r) => r.ageBand === ageBand && r.gender === "Male")?.customers ?? 0,
  }));
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-72 w-full"
      role="img"
      aria-label="Clientes por rango de edad, separados por género"
    >
      <BarChart accessibilityLayer data={rows}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="ageBand" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ValueTooltip format={formatInteger} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="Female" fill="var(--color-Female)" radius={3} maxBarSize={40} />
        <Bar dataKey="Male" fill="var(--color-Male)" radius={3} maxBarSize={40} />
      </BarChart>
    </ChartContainer>
  );
}
