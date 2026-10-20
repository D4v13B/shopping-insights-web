// Tipos del contrato de la API, generados desde openapi.json con `bun run sync:api`.
export type { components, operations, paths } from "./api";

import type { components } from "./api";

type Schemas = components["schemas"];

export type Kpis = Schemas["Kpis"];
export type FilterOptions = Schemas["FilterOptions"];
export type SalesByCategory = Schemas["SalesByCategory"];
export type SalesBySeason = Schemas["SalesBySeason"];
export type ProductRanking = Schemas["ProductRanking"];
export type Segments = Schemas["Segments"];
export type Demographics = Schemas["Demographics"];
export type States = Schemas["States"];
export type Purchase = Schemas["Purchase"];
export type PurchasePage = Schemas["PurchasePage"];
export type EtlRun = Schemas["EtlRun"];
export type Problem = Schemas["Problem"];
