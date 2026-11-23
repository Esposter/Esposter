/* oxlint-disable id-denylist -- `dir` is Nitro's own option name */
import type { NuxtConfig } from "nuxt/schema";

import { compatibilityDate } from "#configuration/compatibilityDate";
import { TEMPORAL_POLYFILL_BASE_URL } from "#configuration/constants";
import { getCloudflareEnvironment, getEnvironmentWrangler } from "#configuration/wrangler";
import { MEGABYTE } from "#shared/services/app/constants";
import { GENSHIN_REGION_DATA_BASE_URL } from "#shared/services/genshin/constants";
import { PDF_CMAP_BASE_URL, PDF_STANDARD_FONT_DATA_BASE_URL, PDF_WASM_BASE_URL } from "#src/services/pdf/constants";
import { readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// The world package's own folder, found through its manifest, which is there before any build
const genshinWorldDirectory = dirname(createRequire(import.meta.url).resolve("genshin-world/package.json"));
// The PDF renderer's own folder of character maps, fonts and decoders, served from its install rather than a copy
const pdfjsDistDirectory = dirname(createRequire(import.meta.url).resolve("pdfjs-dist/package.json"));
// The Workers runtime the dev runner emulates Workers with: the catalog's miniflare, which `@esposter/db-mock`
// Installs, Reached through that package's manifest since the app declares no miniflare of its own
const dbMockDirectory = dirname(createRequire(import.meta.url).resolve("@esposter/db-mock/package.json"));
const miniflareDirectory = dirname(
  createRequire(join(dbMockDirectory, "package.json")).resolve("miniflare/package.json"),
);

export const nitro: NonNullable<NuxtConfig["nitro"]> = {
  // The Worker's own wrangler configuration, written beside the build. A build is made for one environment (CI sets
  // CLOUDFLARE_ENV by its branch, a local build is prod and the dev server development), so the file holds that
  // Environment alone: wrangler refuses `env` blocks in a configuration a tool generated. The app's stateful half is
  // The Realtime Worker's Durable Objects, which the bindings in `wrangler.ts` reach by that Worker's script name
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: { compatibility_date: compatibilityDate, ...getEnvironmentWrangler(getCloudflareEnvironment()) },
  },
  // The dev runner loads `miniflare` by name from the app root, where nothing resolves it, so it is pointed at the
  // Install Of the catalog's miniflare that `@esposter/db-mock` holds
  deps: { paths: { miniflare: miniflareDirectory } },
  // A package resolves the build the Workers runtime runs, as wrangler's own bundler resolves it: a Worker is a web
  // Runtime, so a package's browser build is taken over its Node one. The preset names `workerd` and `worker` alone, so
  // Cheerio, which mjml reaches through juice, resolved its Node build, whose undici compiles WebAssembly the runtime
  // Refuses. Vitest runs the app in Node, where msw intercepts Node's own requests, so its suites keep the Node builds:
  // Under `browser`, msw's interceptors resolve their Node entries to nothing
  exportConditions: process.env.VITEST ? [] : ["workerd", "worker", "browser"],
  hooks: {
    // Nitro's Vite builder, the one Nuxt 5 builds through, prints no size summary, so each Output directory's size is
    // Logged once the build is written. Source maps are left out, since they are never uploaded
    compiled: async ({ logger, options: { output } }) => {
      const directorySizes = await Promise.all(
        Object.entries({ public: output.publicDir, server: output.serverDir }).map(async ([name, directory]) => {
          const entries = await readdir(directory, { recursive: true, withFileTypes: true });
          const sizes = await Promise.all(
            entries
              .filter((entry) => entry.isFile() && !entry.name.endsWith(".map"))
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
  // The Workers runtime has no Temporal, and server modules read it as they load, so it is installed before the entry
  polyfills: ["temporal-polyfill/global"],
  preset: "cloudflare_module",
  // A package polyfill is served from its own install under `/polyfills/`, so its version is the lockfile's
  publicAssets: [
    // Each Genshin region's data is served from the world package's own copy, so a region is fetched and released
    // By reach rather than bundled
    { baseURL: GENSHIN_REGION_DATA_BASE_URL, dir: join(genshinWorldDirectory, "src/data/regions") },
    { baseURL: PDF_CMAP_BASE_URL, dir: join(pdfjsDistDirectory, "cmaps") },
    { baseURL: PDF_STANDARD_FONT_DATA_BASE_URL, dir: join(pdfjsDistDirectory, "standard_fonts") },
    { baseURL: PDF_WASM_BASE_URL, dir: join(pdfjsDistDirectory, "wasm") },
    { baseURL: TEMPORAL_POLYFILL_BASE_URL, dir: dirname(createRequire(import.meta.url).resolve("temporal-polyfill")) },
  ],
};
