import { z } from "zod";

// Dominios cerrados (los mismos que valida la API).
export const CATEGORIES = ["Accessories", "Clothing", "Footwear", "Outerwear"] as const;
export const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;
export const GENDERS = ["Female", "Male"] as const;
export const AGE_BANDS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;
export const REGIONS = ["Northeast", "Midwest", "South", "West"] as const;
const BOOL = ["true", "false"] as const;

/**
 * Filtros globales en los search params de la URL. `.catch(undefined)` hace que un valor inválido
 * en un enlace compartido se ignore en vez de romper la página.
 */
export const filtersSchema = z.object({
  category: z.enum(CATEGORIES).optional().catch(undefined),
  season: z.enum(SEASONS).optional().catch(undefined),
  gender: z.enum(GENDERS).optional().catch(undefined),
  ageBand: z.enum(AGE_BANDS).optional().catch(undefined),
  region: z.enum(REGIONS).optional().catch(undefined),
  state: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional()
    .catch(undefined),
  subscribed: z.enum(BOOL).optional().catch(undefined),
  promoUsed: z.enum(BOOL).optional().catch(undefined),
  paymentMethod: z.string().max(40).optional().catch(undefined),
});

export type Filters = z.infer<typeof filtersSchema>;
export type FilterKey = keyof Filters;

export const FILTER_KEYS = Object.keys(filtersSchema.shape) as FilterKey[];

/** Solo los filtros definidos, en orden estable: sirve como parte de la query key. */
export function pickFilters(search: Partial<Record<string, unknown>>): Filters {
  const out: Record<string, string> = {};
  for (const key of FILTER_KEYS) {
    const value = search[key];
    if (typeof value === "string" && value !== "") out[key] = value;
  }
  return out as Filters;
}

export function countActiveFilters(filters: Filters): number {
  return Object.keys(pickFilters(filters)).length;
}
