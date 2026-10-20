import createClient, { type Middleware } from "openapi-fetch";
import type { Problem, paths } from "@/contract";

const isServer = typeof window === "undefined";

/** En SSR se usa la red interna de Docker; en el navegador, la URL pública. */
function baseUrl(): string {
  if (isServer) return process.env.API_INTERNAL_URL ?? "http://localhost:8080";
  return import.meta.env.VITE_API_URL ?? "http://localhost:8080";
}

/** Error de la API con el problem+json (RFC 9457) ya parseado. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem?: Problem,
  ) {
    super(problem?.detail ?? problem?.title ?? `Error HTTP ${status}`);
    this.name = "ApiError";
  }
}

const internalToken: Middleware = {
  onRequest({ request }) {
    // El SSR comparte IP: con este token la API no lo cuenta para el rate limit.
    const token = isServer ? process.env.INTERNAL_API_TOKEN : undefined;
    if (token) request.headers.set("X-Internal-Token", token);
    return request;
  },
};

// fetch se resuelve en cada llamada (no al crear el cliente): permite interceptarlo en tests.
export const api = createClient<paths>({
  baseUrl: baseUrl(),
  fetch: (request) => globalThis.fetch(request),
});
api.use(internalToken);

/** Devuelve `data` o lanza ApiError: así TanStack Query maneja los errores de forma uniforme. */
export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await promise;
  if (error !== undefined || data === undefined) {
    throw new ApiError(response.status, error as Problem | undefined);
  }
  return data;
}

export function publicApiUrl(path: string, query?: Record<string, string | undefined>): string {
  const url = new URL(path, import.meta.env.VITE_API_URL ?? "http://localhost:8080");
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }
  return url.toString();
}
