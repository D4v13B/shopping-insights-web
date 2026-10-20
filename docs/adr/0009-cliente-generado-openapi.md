# 0009 · Cliente tipado generado desde OpenAPI

**Estado:** Aceptada

## Contexto
El frontend consume 14 endpoints. Escribir sus tipos a mano los desincroniza de la API.

## Opciones
1. **openapi-typescript + openapi-fetch**, generados desde el contrato real.
2. Hono RPC (`hc<AppType>`): tipos sin generar código, pero acopla el frontend al código de la API y
   no sirve a otros consumidores.
3. Tipos a mano.

## Decisión
En la API, `bun run gen:api` exporta `openapi.json` sin levantar el servidor. La web guarda una copia
versionada de ese contrato y `bun run sync:api` la actualiza y genera `src/contract/api.d.ts`
(ver [0016](https://github.com/D4v13B/shopping-insights-api/blob/main/docs/adr/0016-tres-repositorios.md)).
La web usa `openapi-fetch` con esos tipos. El CI de cada repo falla si su archivo generado no
coincide con el versionado.

## Consecuencias
- Un cambio de contrato rompe el `typecheck` del frontend en vez de fallar en producción.
- El mismo contrato sirve para Swagger y para cualquier otro cliente.
