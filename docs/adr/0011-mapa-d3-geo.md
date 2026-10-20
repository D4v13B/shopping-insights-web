# 0011 · Mapa con d3-geo en lugar de una librería de mapas

**Estado:** Aceptada

## Contexto
La vista Geografía necesita un mapa coroplético de EE.UU. Recharts no hace mapas.

## Opciones
1. **SVG propio con d3-geo + us-atlas** (TopoJSON ya proyectado en Albers USA).
2. Leaflet o Mapbox: pensados para mapas con teselas, pesados y con estilos propios.
3. react-simple-maps: práctico, pero sin mantenimiento activo.

## Decisión
`UsChoropleth` dibuja los estados como `<path>` con `geoPath()` sobre `states-albers-10m.json`. Los
colores salen de `--chart-1 … --chart-5` del preset, en 5 tramos de igual ancho.

## Consecuencias
- El mapa respeta el tema del dashboard y pesa poco (sin teselas ni tokens externos).
- Accesible: cada estado es enfocable con Tab, con `aria-label`; el tooltip también se muestra al
  enfocar, y hay una tabla con los 50 estados como alternativa en texto.
- Los estados se unen por nombre (propiedad `name` del TopoJSON), sin tabla de códigos FIPS.
