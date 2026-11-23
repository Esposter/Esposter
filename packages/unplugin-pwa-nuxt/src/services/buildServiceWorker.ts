import type { PwaContext } from "#src/models/PwaContext";
import type { Nuxt } from "@nuxt/schema";
import type { Nitro } from "nitro/types";

import { PRECACHE_EXTENSIONS } from "#src/services/constants";
import { createManifestTransform } from "#src/services/createManifestTransform";
import { getNitroNavigationDenylist } from "#src/services/getNitroNavigationDenylist";
import { getStrategyOptions } from "#src/services/getStrategyOptions";
import { globSync } from "node:fs";

const PAYLOAD_PATTERN = "**/_payload.json";

/**
 * The worker is built from what Nitro has already copied into its public folder, which is every file the precache
 * lists, so it is built here and not as the client bundle closes. What the precache holds and where a navigation falls
 * back to are settled here too, since they depend on what Nitro prerendered and which routes the server answers.
 */
export const buildServiceWorker = async (context: PwaContext, nuxt: Nuxt, nitro: Nitro): Promise<void> => {
  if (context.resolvedOptions.disable) return;

  const { baseURL } = nuxt.options.app;
  const options = getStrategyOptions(context);
  if (options) {
    // A payload exists only for a prerendered page, and workbox fails a pattern that matches nothing
    const payloadPatterns =
      globSync(PAYLOAD_PATTERN, { cwd: nitro.options.output.publicDir }).length > 0 ? [PAYLOAD_PATTERN] : [];
    // The app manifest under `_nuxt/builds/meta/` is named by its build's id and left out. Each deploy serves only its
    // Own, so a worker of an earlier build would fail its whole install on it: the precache fetches one file at a time,
    // And a 404 on the superseded manifest stops it partway through, with the worker never activating
    options.globPatterns ??= [`**/*.{${PRECACHE_EXTENSIONS.join(",")}}`, ...payloadPatterns];
    options.manifestTransforms ??= [createManifestTransform(baseURL)];
  }
  const { generateSW } = context.resolvedOptions;
  if (context.strategy === "generate-sw" && generateSW) {
    if (!("navigateFallback" in generateSW)) generateSW.navigateFallback = baseURL;
    generateSW.navigateFallbackDenylist ??= getNitroNavigationDenylist(nitro);
  }
  await context.runBuild();
};
