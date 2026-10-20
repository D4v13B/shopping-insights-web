import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ApiError, api, publicApiUrl, unwrap } from "./api";

const BASE = "http://localhost:8080";
const server = setupServer(
  http.get(`${BASE}/api/v1/kpis`, ({ request }) => {
    const category = new URL(request.url).searchParams.get("category");
    return HttpResponse.json({
      revenue: category ? 100 : 233081,
      orders: 1,
      customers: 1,
      avgTicket: 1,
      avgRating: 1,
      subscribedPct: 0,
      promoPct: 0,
    });
  }),
  http.get(`${BASE}/api/v1/purchases`, () =>
    HttpResponse.json(
      {
        type: "urn:shopping-insights:problem:validation-error",
        title: "Parámetros inválidos",
        status: 422,
        detail: "Uno o más parámetros no son válidos",
        instance: "/api/v1/purchases",
        requestId: "req-1",
      },
      { status: 422, headers: { "Content-Type": "application/problem+json" } },
    ),
  ),
);

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("cliente tipado", () => {
  it("envía los filtros como query params", async () => {
    const data = await unwrap(
      api.GET("/api/v1/kpis", { params: { query: { category: "Footwear" } } }),
    );
    expect(data.revenue).toBe(100);
  });

  it("convierte problem+json en ApiError con el detalle", async () => {
    const error = await unwrap(
      api.GET("/api/v1/purchases", { params: { query: { page: 1, pageSize: 20, sort: "x:asc" } } }),
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect((error as ApiError).problem?.requestId).toBe("req-1");
    expect((error as ApiError).message).toBe("Uno o más parámetros no son válidos");
  });

  it("publicApiUrl omite parámetros vacíos", () => {
    expect(
      publicApiUrl("/api/v1/purchases/export", { category: "Clothing", q: undefined, sort: "" }),
    ).toBe(`${BASE}/api/v1/purchases/export?category=Clothing`);
  });
});
