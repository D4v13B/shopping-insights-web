import type { ChartConfig } from "@/components/ui/chart";
import { CATEGORY_LABELS, SEASON_LABELS } from "@/lib/labels";

// Colores del preset (--chart-1 … --chart-5). Nunca se definen colores propios.
export const CHART_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const CATEGORY_ORDER = ["Clothing", "Accessories", "Footwear", "Outerwear"] as const;

export const categoryChartConfig = Object.fromEntries(
  CATEGORY_ORDER.map((category, i) => [
    category,
    { label: CATEGORY_LABELS[category], color: CHART_VARS[i + 1] },
  ]),
) satisfies ChartConfig;

export const seasonChartConfig = Object.fromEntries(
  Object.entries(SEASON_LABELS).map(([season, label], i) => [
    season,
    { label, color: CHART_VARS[i + 1] },
  ]),
) satisfies ChartConfig;
