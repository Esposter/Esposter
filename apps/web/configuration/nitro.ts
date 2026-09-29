import type { NitroConfig } from "nitropack/types";

import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { GENSHIN_REGION_DATA_BASE_URL } from "../shared/services/genshin/constants";
import { TEMPORAL_POLYFILL_BASE_URL } from "./constants";

export const nitro: NitroConfig = {
  // Railway's edge passes responses through uncompressed, so the build writes a brotli copy of each asset for the
  // Server to hand out. Every current engine decodes brotli, so no gzip copy is written
  compressPublicAssets: { brotli: true, gzip: false },
  // Nitro's own esbuild default is es2019, which predates the bigint literals the RBAC permission bitfield uses
  esbuild: { options: { target: "esnext" } },
  // A package polyfill is served from its own install under `/polyfills/`, so its version is the lockfile's
  publicAssets: [
    // Each Genshin region's data is served from the world package's own copy, so a region is fetched and released
    // By reach rather than bundled. It is found through the package's manifest, which is there before any build
    {
      baseURL: GENSHIN_REGION_DATA_BASE_URL,
      // oxlint-disable-next-line id-denylist -- `dir` is Nitro's own option name
      dir: join(dirname(createRequire(import.meta.url).resolve("genshin-world/package.json")), "src/data/regions"),
    },
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
