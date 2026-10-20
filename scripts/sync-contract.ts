// Copia el contrato OpenAPI de la API a openapi.json y regenera src/contract/api.d.ts.
// Uso: bun run sync:api [origen]
// El origen puede ser una ruta o una URL; por defecto, el repo hermano de la API.
//   bun run sync:api http://localhost:8080/openapi.json
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const source =
  process.argv[2] ?? process.env.OPENAPI_SOURCE ?? "../shopping-insights-api/openapi.json";

const raw = /^https?:\/\//.test(source)
  ? await fetch(source).then((r) => {
      if (!r.ok) throw new Error(`${source} respondió ${r.status}`);
      return r.text();
    })
  : await readFile(source, "utf8");

await writeFile("openapi.json", `${JSON.stringify(JSON.parse(raw), null, 2)}\n`);
console.log(`Contrato copiado desde ${source}`);
execFileSync("bunx", ["openapi-typescript", "openapi.json", "-o", "src/contract/api.d.ts"], {
  stdio: "inherit",
});
