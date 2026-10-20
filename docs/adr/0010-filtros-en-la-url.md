# 0010 · Estado de los filtros en la URL

**Estado:** Aceptada

## Contexto
Un analista quiere compartir lo que está viendo y que el estado sobreviva a una recarga.

## Opciones
1. **Search params validados por TanStack Router.**
2. Estado global en memoria (Zustand o Context): se pierde al recargar y no se comparte.
3. localStorage: persiste, pero no se comparte.

## Decisión
Los 9 filtros se validan con Zod en la ruta raíz (`validateSearch`) y cada ruta declara sus filtros
como `loaderDeps`. Un valor inválido en un enlace se descarta con `.catch()` en vez de romper la
página. `/compras` añade `page`, `pageSize`, `sort` y `q`.

## Consecuencias
- Copiar la URL reproduce exactamente la vista; el botón Atrás funciona como se espera.
- Los filtros forman parte de las query keys de TanStack Query: cada combinación se cachea.
- Cambiar un filtro reinicia la paginación, porque la página anterior puede no existir.
