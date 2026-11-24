import type { UserConfig } from "tsdown";

import { NON_SOURCE_SUFFIXES } from "#src/services/constants";
import { getTsdownConfigurationNode } from "#src/services/getTsdownConfigurationNode";
import { mergeConfig } from "tsdown";

// Two kinds of entry, and no barrel.
// `index` is the module Nuxt imports while it reads `nuxt.config`, in Node, before any bundler runs.
// The runtime directory is every other entry, one per file.
// Nuxt bundles the client half into the app, and Nitro bundles the server half into the server.
// Each imports a framework the config loader must never evaluate.
// The module and its generated handlers name each file by its own path.
// Unbundled, a new runtime file ships and gains its `exports` entry with nothing to add by hand.
// A `services` file is the runtime's own: it ships, since the files beside it import it relatively.
// It stays out of the `exports` map: the public surface is the functions a consumer calls and the models typing them.
// A test, benchmark, fixture or reference beside a runtime file is no entry.
// The same list the barrels exclude is what keeps it out.
// A package adds the runtime files its own `exports` map leaves out.
export const getTsdownConfigurationNuxtModule = (excludedExports: string[]): UserConfig =>
  mergeConfig(getTsdownConfigurationNode(), {
    entry: [
      { index: "src/module.ts" },
      "src/runtime/**/*.ts",
      ...NON_SOURCE_SUFFIXES.map((suffix) => `!src/**/*${suffix}`),
      "!src/**/*.d.ts",
    ],
    exports: { exclude: ["runtime/**/services/**", ...excludedExports] },
    root: "src",
    unbundle: true,
  });
