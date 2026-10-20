import { describe, expect, it } from "vitest";
import { regionTotals } from "./geo";
import { findingsFrom } from "./quality";

describe("findingsFrom", () => {
  it("traduce el reporte del ETL a hallazgos", () => {
    const findings = findingsFrom({
      rows: { read: 3900, valid: 3900, rejected: 0 },
      nulls_by_column: {},
      discount_equals_promo: { equal: true, mismatches: 0, action: "x" },
      frequency_synonyms_merged: { biweekly: ["Fortnightly", "Bi-Weekly"] },
      subscribed_women: 0,
      has_date_column: false,
    });
    expect(findings.map((f) => f.id)).toEqual([
      "rows",
      "nulls",
      "promo",
      "frequency",
      "bias",
      "dates",
    ]);
    expect(findings.find((f) => f.id === "bias")?.severity).toBe("warning");
    expect(findings.find((f) => f.id === "frequency")?.detail).toContain("Fortnightly = Bi-Weekly");
  });

  it("sin reporte no hay hallazgos", () => {
    expect(findingsFrom(null)).toEqual([]);
  });
});

describe("regionTotals", () => {
  it("suma por región y calcula la participación", () => {
    const totals = regionTotals([
      { region: "West", revenue: 300, orders: 3 },
      { region: "South", revenue: 100, orders: 1 },
      { region: "West", revenue: 100, orders: 1 },
    ]);
    expect(totals).toEqual([
      { region: "West", revenue: 400, orders: 4, sharePct: 80 },
      { region: "South", revenue: 100, orders: 1, sharePct: 20 },
    ]);
  });
});
