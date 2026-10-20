import type { ComponentProps, CSSProperties } from "react";
import { ChartTooltipContent, useChart } from "@/components/ui/chart";

interface RowProps {
  name: string;
  value: unknown;
  color?: string;
  format: (value: number) => string;
}

function FormattedRow({ name, value, color, format }: RowProps) {
  const { config } = useChart();
  return (
    <>
      <div
        className="size-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
        style={{ "--color-bg": color } as CSSProperties}
      />
      <div className="flex flex-1 items-center justify-between gap-4 leading-none">
        <span className="text-muted-foreground">{config[name]?.label ?? name}</span>
        <span className="font-mono font-medium text-foreground tabular-nums">
          {format(Number(value))}
        </span>
      </div>
    </>
  );
}

/** Tooltip de shadcn con los valores formateados (moneda, porcentaje, etc.) en locale es-PA. */
export function ValueTooltip({
  format,
  ...props
}: ComponentProps<typeof ChartTooltipContent> & { format: (value: number) => string }) {
  // Recharts inyecta active/payload/label al clonar el elemento: se reenvían tal cual.
  return (
    <ChartTooltipContent
      {...props}
      formatter={(value, name, item) => (
        <FormattedRow
          name={String(name)}
          value={value}
          color={item.payload?.fill ?? item.color}
          format={format}
        />
      )}
    />
  );
}
