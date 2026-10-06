import type { NuxtConfig } from "nuxt/schema";

import { readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { MEGABYTE } from "../shared/services/app/constants.ts";
import { GENSHIN_REGION_DATA_BASE_URL } from "../shared/services/genshin/constants.ts";
import { TEMPORAL_POLYFILL_BASE_URL } from "./constants.ts";

export const nitro: NuxtConfig["nitro"] = {
  // Railway's edge passes responses through uncompressed, so the build writes a brotli copy of each asset for the
  // Server to hand out. Every current engine decodes brotli, so no gzip copy is written
  compressPublicAssets: { brotli: true, gzip: false },
  hooks: {
    // Nitro's Vite builder, the one Nuxt 5 builds through, dropped the size summary its Rollup builder prints, so each
    // Output directory's size is logged once the build is written. Source maps are left out, and the brotli size is
    // What is served: a file's brotli copy where the build wrote one, the file itself where it did not
    compiled: async ({ logger, options: { output } }) => {
      for (const [name, directory] of Object.entries({ public: output.publicDir, server: output.serverDir })) {
        const entries = await readdir(directory, { recursive: true, withFileTypes: true });
        const paths = new Set(
          entries.filter((entry) => entry.isFile()).map((entry) => join(entry.parentPath, entry.name)),
        );
        const sizes = await Promise.all(
          [...paths]
            .filter((path) => !/\.(?:br|map)$/u.test(path))
            .map(async (path) => {
              const { size } = await stat(path);
              const brotliPath = `${path}.br`;
              return { brotliSize: paths.has(brotliPath) ? (await stat(brotliPath)).size : size, size };
            }),
        );
        const size = sizes.reduce((total, fileSize) => total + fileSize.size, 0);
        const brotliSize = sizes.reduce((total, fileSize) => total + fileSize.brotliSize, 0);
        logger.info(
          `Σ ${name}: ${(size / MEGABYTE).toFixed(2)} MB (${(brotliSize / MEGABYTE).toFixed(2)} MB brotli, ${sizes.length} files)`,
        );
      }
    },
  },
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
};
