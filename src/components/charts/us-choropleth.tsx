import { geoPath } from "d3-geo";
import { type CSSProperties, useMemo, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import statesTopology from "us-atlas/states-albers-10m.json";
import { formatCurrency, formatInteger } from "@/lib/format";
import { label, REGION_LABELS } from "@/lib/labels";
import { CHART_VARS } from "./palette";

export interface StateDatum {
  stateCode: string;
  stateName: string;
  region: string;
  revenue: number;
  orders: number;
}

// us-atlas ya viene proyectado (Albers USA, 975×610): no hace falta proyectar en el cliente.
const topology = statesTopology as unknown as Topology<{
  states: GeometryCollection<{ name: string }>;
}>;
const shapes = feature(topology, topology.objects.states).features;
const path = geoPath();

/** Cinco tramos de igual ancho entre el mínimo y el máximo, mapeados a --chart-1 … --chart-5. */
export function bucketOf(value: number, min: number, max: number): number {
  if (max <= min) return value > 0 ? CHART_VARS.length - 1 : 0;
  const ratio = (value - min) / (max - min);
  return Math.min(CHART_VARS.length - 1, Math.floor(ratio * CHART_VARS.length));
}

export function UsChoropleth({ data }: { data: StateDatum[] }) {
  const [active, setActive] = useState<StateDatum | null>(null);
  const byName = useMemo(() => new Map(data.map((d) => [d.stateName, d])), [data]);
  const values = data.map((d) => d.revenue);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative">
        {/* biome-ignore lint/a11y/useSemanticElements: agrupa los estados interactivos del mapa; un <fieldset> no es válido dentro de SVG. */}
        <svg
          viewBox="0 0 975 610"
          className="h-auto w-full"
          role="group"
          aria-label="Mapa de ingresos por estado de EE.UU."
        >
          {shapes.map((shape) => {
            const name = shape.properties?.name ?? "";
            const datum = byName.get(name);
            const d = path(shape) ?? undefined;
            if (!datum) {
              return <path key={name} d={d} className="fill-muted stroke-background" aria-hidden />;
            }
            const bucket = bucketOf(datum.revenue, min, max);
            return (
              // biome-ignore lint/a11y/useSemanticElements: un <path> de SVG no tiene equivalente semántico; se expone como botón accesible.
              <path
                key={name}
                d={d}
                role="button"
                tabIndex={0}
                aria-label={`${datum.stateName}: ${formatCurrency(datum.revenue)} en ${formatInteger(datum.orders)} órdenes`}
                className="cursor-pointer fill-(--fill) stroke-background stroke-[0.75] outline-none transition-opacity hover:opacity-80 focus-visible:stroke-foreground focus-visible:stroke-2"
                style={{ "--fill": CHART_VARS[bucket] } as CSSProperties}
                onMouseEnter={() => setActive(datum)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(datum)}
                onBlur={() => setActive(null)}
              />
            );
          })}
        </svg>
        {active ? (
          <div
            aria-live="polite"
            className="pointer-events-none absolute top-2 left-2 rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md"
          >
            <p className="font-medium">
              {active.stateName} ({active.stateCode})
            </p>
            <p className="text-muted-foreground">{label(REGION_LABELS, active.region)}</p>
            <p className="tabular-nums">
              {formatCurrency(active.revenue)} · {formatInteger(active.orders)} órdenes
            </p>
          </div>
        ) : null}
      </div>
      <figcaption className="flex flex-wrap items-center gap-3 text-muted-foreground">
        <span>Ingresos:</span>
        {CHART_VARS.map((color, i) => {
          const from = min + ((max - min) * i) / CHART_VARS.length;
          return (
            <span key={color} className="flex items-center gap-1">
              <span
                className="size-3 rounded-[2px] bg-(--fill)"
                style={{ "--fill": color } as CSSProperties}
                aria-hidden
              />
              {`≥ ${formatCurrency(Math.round(from))}`}
            </span>
          );
        })}
      </figcaption>
    </figure>
  );
}
