import type { PwaContext } from "#src/models/PwaContext";
import type { Nuxt } from "@nuxt/schema";
import type { ConfigurePWAOptions } from "@unplugin-pwa/core/context-types";

import { createNavigationDenylistPlugin } from "#src/services/createNavigationDenylistPlugin";
import { getImmutableAssets } from "#src/services/getImmutableAssets";
import { resolve } from "node:path";

/**
 * Where the engine resolves its options, the paths a Nuxt app fixes: the worker is written into the folder Nitro
 * serves, and a worker built from source can import the server's navigation denylist. `getNavigationDenylist` is read
 * as the worker is built, since the server's routes are only settled by then. The engine reads the manifest's icons from
 * Vite's `publicDir`, which Nuxt turns off since Nitro serves the folder, so it is Nuxt's own public folder here.
 */
export const configurePwaOptions = (
  context: PwaContext,
  nuxt: Nuxt,
  outDir: string,
  getNavigationDenylist: () => readonly RegExp[],
): ConfigurePWAOptions | undefined => {
  const { buildSW, pwaAssets } = context.resolvedOptions;
  const publicDir = resolve(nuxt.options.rootDir, nuxt.options.dir.public);
  context.publicDir = publicDir;
  if (pwaAssets) pwaAssets.integration = { baseUrl: nuxt.options.app.baseURL, outDir, publicDir };
  if (buildSW) {
    const { plugins } = buildSW;
    buildSW.plugins = (swType) => [plugins?.(swType), createNavigationDenylistPlugin(getNavigationDenylist)];
  }
  if (context.devEnvironment) return undefined;

  context.outDir = outDir;
  context.resolvedOptions.outDir = outDir;
  // The engine writes `swSrc` and `globDirectory` relative to this folder and workbox reads them relative to the
  // Process's, so they are one
  return { cwd: process.cwd(), immutableAssets: getImmutableAssets(nuxt), outDir };
};
