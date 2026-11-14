import type { NuxtConfig } from "nuxt/schema";

import { readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { CloudflareEnvironment } from "../../../packages/db-schema/src/models/cloudflare/CloudflareEnvironment.ts";
import {
  PDF_CMAP_BASE_URL,
  PDF_STANDARD_FONT_DATA_BASE_URL,
  PDF_WASM_BASE_URL,
} from "../app/services/pdf/constants.ts";
import { MEGABYTE } from "../shared/services/app/constants.ts";
import {
  GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL,
  GENSHIN_REGION_DATA_BASE_URL,
} from "../shared/services/genshin/constants.ts";
import { TEMPORAL_POLYFILL_BASE_URL } from "./constants.ts";
import { getEnvironmentWrangler } from "./wrangler.ts";

// The world package's own folder, found through its manifest, which is there before any build
const genshinWorldDirectory = dirname(createRequire(import.meta.url).resolve("genshin-world/package.json"));
// The PDF renderer's own folder of character maps, fonts and decoders, served from its install rather than a copy
const pdfjsDistDirectory = dirname(createRequire(import.meta.url).resolve("pdfjs-dist/package.json"));

export const nitro: NuxtConfig["nitro"] = {
  // The Worker's own wrangler configuration, written beside the build. The top level is prod, which a local run and an
  // Unset CLOUDFLARE_ENV use; the env blocks are what CI deploys, `dev` or `prod` by its branch. The Durable Object is
  // The app's stateful half, which the Worker forwards tRPC to, and the Scheduler is the functions Worker's
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      compatibility_date: "2026-11-01",
      env: {
        dev: getEnvironmentWrangler(CloudflareEnvironment.Development),
        prod: getEnvironmentWrangler(CloudflareEnvironment.Production),
      },
      migrations: [{ new_sqlite_classes: ["$DurableObject"], tag: "v1" }],
      ...getEnvironmentWrangler(CloudflareEnvironment.Production),
    },
  },
  hooks: {
    // Nitro's Vite builder, the one Nuxt 5 builds through, dropped the size summary its Rollup builder prints, so each
    // Output directory's size is logged once the build is written. Source maps are left out, since they are never uploaded
    compiled: async ({ logger, options: { output } }) => {
      const directorySizes = await Promise.all(
        Object.entries({ public: output.publicDir, server: output.serverDir }).map(async ([name, directory]) => {
          const entries = await readdir(directory, { recursive: true, withFileTypes: true });
          const sizes = await Promise.all(
            entries
              .filter((entry) => entry.isFile() && !/\.map$/u.test(entry.name))
              .map(async (entry) => (await stat(join(entry.parentPath, entry.name))).size),
          );
          return { name, sizes };
        }),
      );
      for (const { name, sizes } of directorySizes) {
        const size = sizes.reduce((total, fileSize) => total + fileSize, 0);
        logger.info(`Σ ${name}: ${(size / MEGABYTE).toFixed(2)} MB (${sizes.length} files)`);
      }
    },
  },
  preset: "cloudflare_module",
  // A package polyfill is served from its own install under `/polyfills/`, so its version is the lockfile's
  publicAssets: [
    // Each Genshin region's data is served from the world package's own copy, so a region is fetched and released
    // By reach rather than bundled
    {
      baseURL: GENSHIN_REGION_DATA_BASE_URL,
      // oxlint-disable-next-line id-denylist -- `dir` is Nitro's own option name
      dir: join(genshinWorldDirectory, "src/data/regions"),
    },
    // The recordings the login's music plays over its synthesizer, fetched once the login shows
    {
      baseURL: GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL,
      // oxlint-disable-next-line id-denylist -- as above
      dir: join(genshinWorldDirectory, "src/data/login/recordings"),
    },
    {
      baseURL: PDF_CMAP_BASE_URL,
      // oxlint-disable-next-line id-denylist -- `dir` is Nitro's own option name
      dir: join(pdfjsDistDirectory, "cmaps"),
    },
    {
      baseURL: PDF_STANDARD_FONT_DATA_BASE_URL,
      // oxlint-disable-next-line id-denylist -- as above
      dir: join(pdfjsDistDirectory, "standard_fonts"),
    },
    {
      baseURL: PDF_WASM_BASE_URL,
      // oxlint-disable-next-line id-denylist -- as above
      dir: join(pdfjsDistDirectory, "wasm"),
    },
    {
      baseURL: TEMPORAL_POLYFILL_BASE_URL,
      // oxlint-disable-next-line id-denylist -- `dir` is Nitro's own option name
      dir: dirname(createRequire(import.meta.url).resolve("temporal-polyfill")),
    },
  ],
};
