# syntax=docker/dockerfile:1
FROM oven/bun:1.3.11-slim AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# VITE_API_URL se incrusta en el bundle del navegador en este paso.
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

# El bundle SSR deja las dependencias como externas: el runtime necesita las de producción.
FROM oven/bun:1.3.11-slim AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Runtime en Node: TanStack Start lo soporta oficialmente (con Bun, react-dom/server.bun falla
# en modo producción). srvx sirve los estáticos y el handler SSR.
FROM node:24-slim AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node server.mjs package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD ["node", "-e", "fetch('http://localhost:3000/calidad').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "server.mjs"]
