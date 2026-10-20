import { describe, expect, it } from "vitest";
import { countActiveFilters, filtersSchema, pickFilters } from "./filters";

describe("filtros en la URL", () => {
  it("un valor inválido en un enlace compartido se ignora en vez de romper la vista", () => {
    expect(filtersSchema.parse({ category: "Toys", season: "Winter", state: "texas" })).toEqual({
      category: undefined,
      season: "Winter",
      state: undefined,
    });
  });

  it("pickFilters conserva solo filtros definidos (sirve de query key estable)", () => {
    expect(
      pickFilters({
        category: "Clothing",
        page: 3,
        sort: "age:asc",
        gender: undefined,
        region: "",
      }),
    ).toEqual({ category: "Clothing" });
  });

  it("el orden de los params no cambia la key", () => {
    const a = pickFilters({ season: "Fall", category: "Clothing" });
    const b = pickFilters({ category: "Clothing", season: "Fall" });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("cuenta los filtros activos", () => {
    expect(countActiveFilters({ category: "Clothing", subscribed: "false" })).toBe(2);
    expect(countActiveFilters({})).toBe(0);
  });
});
