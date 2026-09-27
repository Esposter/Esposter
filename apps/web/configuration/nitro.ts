import type { NitroConfig } from "nitropack/types";

import { createRequire } from "node:module";
import { dirname } from "node:path";

import { TEMPORAL_POLYFILL_BASE_URL } from "./constants";

export const nitro: NitroConfig = {
  // Railway's edge passes responses through uncompressed, so the build writes a brotli copy of each asset for the
  // Server to hand out. Every current engine decodes brotli, so no gzip copy is written
  compressPublicAssets: { gzip: false },
  // Nitro's own esbuild default is es2019, which predates the bigint literals the RBAC permission bitfield uses
  esbuild: { options: { target: "esnext" } },
  experimental: { websocket: true },
  // A package polyfill is served from its own install under `/polyfills/`, so its version is the lockfile's
  publicAssets: [
    {
      baseURL: TEMPORAL_POLYFILL_BASE_URL,
      // oxlint-disable-next-line id-denylist -- `dir` is Nitro's own option name
      dir: dirname(createRequire(import.meta.url).resolve("temporal-polyfill")),
    },
  ],
  typescript: {
    tsConfig: {
      compilerOptions: {
        customConditions: ["source"],
        // Nuxt sets it on the app and node projects but not the server's, so type-only imports keep one rule
        // Everywhere
        verbatimModuleSyntax: true,
      },
    },
  },
};
