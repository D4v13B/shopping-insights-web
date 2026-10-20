// Servidor de producción (Node): estáticos de dist/client + SSR de TanStack Start.
// srvx es el servidor que usa TanStack Start; su middleware de estáticos maneja ETag,
// compresión, rangos y bloquea dotfiles y path traversal.
import { serve } from "srvx";
import { staticMiddleware } from "srvx/static";
import ssr from "./dist/server/server.js";

const clientDir = new URL("./dist/client", import.meta.url).pathname;

// Los assets llevan hash en el nombre: se cachean un año. El resto, una hora.
const hashedAssets = staticMiddleware({ dir: clientDir, maxAge: 31_536_000, immutable: true });
const publicFiles = staticMiddleware({ dir: clientDir, maxAge: 3600 });

const server = serve({
  port: Number(process.env.PORT ?? 3000),
  hostname: process.env.HOST ?? "0.0.0.0",
  silent: true,
  middleware: [
    (request, next) =>
      new URL(request.url).pathname.startsWith("/assets/")
        ? hashedAssets(request, next)
        : publicFiles(request, next),
  ],
  fetch: (request) => ssr.fetch(request),
});

await server.ready();
console.log(
  JSON.stringify({ level: "info", service: "web", msg: "web escuchando", url: server.url }),
);

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
}
