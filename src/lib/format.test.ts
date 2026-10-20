import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDuration,
  formatInteger,
  formatPercent,
  formatRating,
} from "./format";

// Intl separa el código de moneda con un espacio no separable (U+00A0).
const nbsp = (text: string) => text.replaceAll(" ", "\u00a0");

describe("formatters es-PA", () => {
  it("moneda: enteros sin centavos y promedios con dos decimales", () => {
    expect(formatCurrency(233081)).toBe(nbsp("USD 233,081"));
    expect(formatCurrency(59.76)).toBe(nbsp("USD 59.76"));
    expect(formatCurrency(60.3)).toBe(nbsp("USD 60.30"));
  });
  it("enteros con separador de miles", () => {
    expect(formatInteger(3900)).toBe("3,900");
  });
  it("porcentaje recibe la escala 0–100 de la API", () => {
    expect(formatPercent(27)).toBe("27%");
    expect(formatPercent(43.25)).toBe("43.3%");
  });
  it("rating con un decimal", () => {
    expect(formatRating(3.1)).toBe("3.1");
  });
  it("duración en ms o s", () => {
    expect(formatDuration(298)).toBe("298 ms");
    expect(formatDuration(1500)).toBe("1.50 s");
  });
});
