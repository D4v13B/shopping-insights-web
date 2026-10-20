import { describe, expect, it } from "vitest";
import { bucketOf } from "./us-choropleth";

describe("bucketOf (escala del mapa)", () => {
  it("reparte en cinco tramos de igual ancho", () => {
    expect(bucketOf(0, 0, 100)).toBe(0);
    expect(bucketOf(19.9, 0, 100)).toBe(0);
    expect(bucketOf(20, 0, 100)).toBe(1);
    expect(bucketOf(99, 0, 100)).toBe(4);
    expect(bucketOf(100, 0, 100)).toBe(4);
  });
  it("si todos los valores son iguales no divide por cero", () => {
    expect(bucketOf(5, 5, 5)).toBe(4);
    expect(bucketOf(0, 0, 0)).toBe(0);
  });
});
