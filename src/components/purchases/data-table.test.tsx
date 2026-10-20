import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Purchase } from "@/contract";
import { nextSort, PurchasesTable, toSortingState } from "./data-table";

const purchase = (id: number): Purchase => ({
  purchaseId: id,
  customerId: id,
  itemName: `Item ${id}`,
  category: "Clothing",
  amountUsd: 50 + id,
  season: "Winter",
  size: "M",
  color: "Red",
  reviewRating: 4.2,
  promoUsed: id % 2 === 0,
  stateCode: "TX",
  stateName: "Texas",
  region: "South",
  paymentMethod: "Cash",
  shippingType: "Express",
  gender: "Female",
  age: 30,
  ageBand: "25-34",
  subscribed: false,
  segment: "Leales",
});

function setup(
  meta = { page: 2, pageSize: 20, total: 65, totalPages: 4 },
  sort = "purchaseId:asc",
) {
  const handlers = { onSortChange: vi.fn(), onPageChange: vi.fn(), onPageSizeChange: vi.fn() };
  render(
    <PurchasesTable data={[purchase(1), purchase(2)]} meta={meta} sort={sort} {...handlers} />,
  );
  return handlers;
}

describe("nextSort / toSortingState", () => {
  it("cicla asc → desc → orden por defecto", () => {
    expect(nextSort("purchaseId:asc", "amountUsd")).toBe("amountUsd:asc");
    expect(nextSort("amountUsd:asc", "amountUsd")).toBe("amountUsd:desc");
    expect(nextSort("amountUsd:desc", "amountUsd")).toBe("purchaseId:asc");
  });
  it("traduce el parámetro de la URL al estado de TanStack Table", () => {
    expect(toSortingState("age:desc")).toEqual([{ id: "age", desc: true }]);
  });
});

describe("PurchasesTable (modo servidor)", () => {
  it("renderiza filas con formato y el rango visible", () => {
    setup();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("USD 51")).toBeInTheDocument();
    expect(screen.getAllByText("Ropa", { selector: "td" })).toHaveLength(2);
    expect(screen.getByText(/21–40 de 65 compras/)).toBeInTheDocument();
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("cambiar de página pide la página correcta a la API (vía la URL)", async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup();
    await user.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    await user.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("los botones se deshabilitan en los extremos", () => {
    setup({ page: 1, pageSize: 20, total: 2, totalPages: 1 });
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
  });

  it("ordenar por una columna envía el sort de la lista blanca", async () => {
    const user = userEvent.setup();
    const { onSortChange } = setup();
    const header = screen.getAllByRole("columnheader").find((h) => within(h).queryByText("Monto"));
    await user.click(within(header as HTMLElement).getByRole("button"));
    expect(onSortChange).toHaveBeenCalledWith("amountUsd:asc");
  });

  it("marca la columna ordenada con aria-sort", () => {
    setup(undefined, "amountUsd:desc");
    const header = screen.getAllByRole("columnheader").find((h) => within(h).queryByText("Monto"));
    expect(header).toHaveAttribute("aria-sort", "descending");
  });

  it("las columnas no ordenables no tienen botón", () => {
    setup();
    const header = screen
      .getAllByRole("columnheader")
      .find((h) => within(h).queryByText("Segmento"));
    expect(within(header as HTMLElement).queryByRole("button")).toBeNull();
  });
});
