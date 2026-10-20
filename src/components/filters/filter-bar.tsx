import { IconFilterOff } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/hooks/use-filters";
import { AGE_BANDS, countActiveFilters, type FilterKey } from "@/lib/filters";
import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  label,
  PAYMENT_LABELS,
  REGION_LABELS,
  SEASON_LABELS,
} from "@/lib/labels";
import { filterOptionsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { FilterSelect, type Option } from "./filter-select";

const toOptions = (values: readonly string[], labels?: Record<string, string>): Option[] =>
  values.map((value) => ({ value, label: labels ? label(labels, value) : value }));

const YES_NO: Option[] = [
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

/** Barra de filtros global: todo su estado vive en la URL. */
/** `stacked` = versión del panel móvil: usa otros ids para no duplicar los de la barra de escritorio. */
export function FilterBar({ stacked = false }: { stacked?: boolean }) {
  const { filters, setFilter, clearFilters } = useFilters();
  const { data: options } = useQuery(filterOptionsQuery());
  const active = countActiveFilters(filters);

  const config: { key: FilterKey; label: string; all: string; options: Option[] }[] = [
    {
      key: "category",
      label: "Categoría",
      all: "Todas",
      options: toOptions(options?.categories ?? [], CATEGORY_LABELS),
    },
    {
      key: "season",
      label: "Temporada",
      all: "Todas",
      options: toOptions(options?.seasons ?? [], SEASON_LABELS),
    },
    {
      key: "gender",
      label: "Género",
      all: "Todos",
      options: toOptions(options?.genders ?? [], GENDER_LABELS),
    },
    {
      key: "ageBand",
      label: "Edad",
      all: "Todas",
      options: toOptions(options?.ageBands ?? AGE_BANDS),
    },
    {
      key: "region",
      label: "Región",
      all: "Todas",
      options: toOptions(options?.regions ?? [], REGION_LABELS),
    },
    {
      key: "state",
      label: "Estado",
      all: "Todos",
      options: (options?.states ?? []).map((s) => ({ value: s.code, label: s.name })),
    },
    { key: "subscribed", label: "Suscrito", all: "Todos", options: YES_NO },
    { key: "promoUsed", label: "Con promoción", all: "Todos", options: YES_NO },
    {
      key: "paymentMethod",
      label: "Método de pago",
      all: "Todos",
      options: toOptions(options?.paymentMethods ?? [], PAYMENT_LABELS),
    },
  ];

  return (
    <section aria-label="Filtros" className="flex flex-col gap-3">
      <div
        className={cn(
          "grid gap-3",
          stacked ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-9",
        )}
      >
        {config.map((f) => (
          <FilterSelect
            key={f.key}
            id={`${stacked ? "mobile-" : ""}filter-${f.key}`}
            label={f.label}
            allLabel={f.all}
            options={f.options}
            value={filters[f.key]}
            onChange={(value) => setFilter(f.key, value)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={active ? "default" : "secondary"}>
          {active
            ? `${active} filtro${active > 1 ? "s" : ""} activo${active > 1 ? "s" : ""}`
            : "Sin filtros"}
        </Badge>
        <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!active}>
          <IconFilterOff data-icon="inline-start" />
          Limpiar filtros
        </Button>
      </div>
    </section>
  );
}
