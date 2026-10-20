import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Purchase } from "@/contract";
import { formatCurrency, formatRating } from "@/lib/format";
import { CATEGORY_LABELS, GENDER_LABELS, label, SEASON_LABELS } from "@/lib/labels";

/** Campos por los que la API permite ordenar (lista blanca del endpoint). */
export const SORTABLE = new Set([
  "purchaseId",
  "itemName",
  "category",
  "amountUsd",
  "reviewRating",
  "season",
  "stateName",
  "age",
]);

const col = createColumnHelper<Purchase>();

export const purchaseColumns = [
  col.accessor("purchaseId", {
    header: "ID",
    cell: (c) => <span className="tabular-nums">{c.getValue()}</span>,
  }),
  col.accessor("itemName", {
    header: "Producto",
    cell: (c) => (
      <div className="flex flex-col">
        <span className="font-medium">{c.getValue()}</span>
        <span className="text-muted-foreground">
          {c.row.original.color} · Talla {c.row.original.size}
        </span>
      </div>
    ),
  }),
  col.accessor("category", {
    header: "Categoría",
    cell: (c) => label(CATEGORY_LABELS, c.getValue()),
  }),
  col.accessor("amountUsd", {
    header: "Monto",
    meta: { align: "right" },
    cell: (c) => <span className="tabular-nums">{formatCurrency(c.getValue())}</span>,
  }),
  col.accessor("season", { header: "Temporada", cell: (c) => label(SEASON_LABELS, c.getValue()) }),
  col.accessor("stateName", {
    header: "Estado",
    cell: (c) => (
      <span>
        {c.getValue()} <span className="text-muted-foreground">({c.row.original.stateCode})</span>
      </span>
    ),
  }),
  col.accessor("age", {
    header: "Cliente",
    cell: (c) => `${label(GENDER_LABELS, c.row.original.gender)}, ${c.getValue()} años`,
  }),
  col.accessor("reviewRating", {
    header: "Rating",
    meta: { align: "right" },
    cell: (c) => <span className="tabular-nums">{formatRating(c.getValue())}</span>,
  }),
  col.accessor("promoUsed", {
    header: "Promo",
    enableSorting: false,
    cell: (c) =>
      c.getValue() ? (
        <Badge variant="secondary">Sí</Badge>
      ) : (
        <span className="text-muted-foreground">No</span>
      ),
  }),
  col.accessor("segment", {
    header: "Segmento",
    enableSorting: false,
    cell: (c) => <Badge variant="outline">{c.getValue()}</Badge>,
  }),
];

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "right";
  }
}
