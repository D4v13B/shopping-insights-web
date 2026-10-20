import { IconCash } from "@tabler/icons-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/format";
import { KpiCard } from "./kpi-card";

describe("KpiCard", () => {
  it("muestra etiqueta, valor formateado y nota", () => {
    render(
      <KpiCard
        label="Ingresos"
        value={formatCurrency(233081)}
        hint="Total del periodo"
        icon={IconCash}
      />,
    );
    expect(screen.getByText("Ingresos")).toBeInTheDocument();
    expect(screen.getByText("USD 233,081")).toBeInTheDocument();
    expect(screen.getByText("Total del periodo")).toBeInTheDocument();
  });
});
