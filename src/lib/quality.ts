import type { EtlRun } from "@/contract";

/** Forma del reporte que genera el ETL (etl/src/shopping_etl/quality.py). */
export interface QualityReport {
  rows?: { read: number; valid: number; rejected: number };
  nulls_by_column?: Record<string, number>;
  discount_equals_promo?: { equal: boolean; mismatches: number; action: string };
  frequency_synonyms_merged?: Record<string, string[]>;
  gender_by_subscription?: { gender: string; subscribed: boolean; len: number }[];
  subscribed_women?: number;
  has_date_column?: boolean;
  segments?: { segment: string; len: number }[];
  segment_thresholds?: { estimated_annual_value: number[]; previous_purchases: number[] };
  source?: string;
}

export interface Finding {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "warning";
}

/** Traduce el reporte técnico a hallazgos legibles para el analista. */
export function findingsFrom(report: QualityReport | null | undefined): Finding[] {
  if (!report) return [];
  const out: Finding[] = [];
  const rows = report.rows;
  if (rows) {
    out.push({
      id: "rows",
      title: rows.rejected
        ? `${rows.rejected} filas rechazadas`
        : "Todas las filas pasaron la validación",
      detail: `Se leyeron ${rows.read} filas; ${rows.valid} válidas y ${rows.rejected} rechazadas (quedan en staging.rejected_rows con su motivo).`,
      severity: rows.rejected ? "warning" : "info",
    });
  }
  const nulls = Object.keys(report.nulls_by_column ?? {});
  out.push({
    id: "nulls",
    title: nulls.length ? `Hay valores nulos en ${nulls.length} columnas` : "Sin valores nulos",
    detail: nulls.length
      ? `Columnas: ${nulls.join(", ")}.`
      : "Ninguna columna del archivo tiene valores vacíos.",
    severity: nulls.length ? "warning" : "info",
  });
  const promo = report.discount_equals_promo;
  if (promo) {
    out.push({
      id: "promo",
      title: promo.equal
        ? "“Discount Applied” y “Promo Code Used” son idénticas"
        : `“Discount Applied” y “Promo Code Used” difieren en ${promo.mismatches} filas`,
      detail: "Son redundantes: se unifican en una sola columna promo_used.",
      severity: "info",
    });
  }
  const synonyms = Object.entries(report.frequency_synonyms_merged ?? {});
  if (synonyms.length) {
    out.push({
      id: "frequency",
      title: "Frecuencias de compra con sinónimos",
      detail: synonyms
        .map(([label, originals]) => `${originals.join(" = ")} → ${label}`)
        .join("; "),
      severity: "info",
    });
  }
  if (report.subscribed_women === 0) {
    out.push({
      id: "bias",
      title: "Ninguna mujer está suscrita",
      detail:
        "Sesgo del dataset sintético: los análisis de suscripción por género deben leerse con cautela.",
      severity: "warning",
    });
  }
  if (report.has_date_column === false) {
    out.push({
      id: "dates",
      title: "El dataset no tiene fechas",
      detail: "No hay series de tiempo; la única dimensión temporal es la temporada.",
      severity: "warning",
    });
  }
  return out;
}

export function lastSuccessful(runs: EtlRun[]): EtlRun | undefined {
  return runs.find((r) => r.status === "success");
}
