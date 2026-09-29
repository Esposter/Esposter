import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Two kinds of entry, and no barrel. `index` is the module Nuxt imports while it reads `nuxt.config`, in Node, before any
// Bundler runs. The runtime directory is every other entry, one per file: Nuxt bundles the client half into the app and
// Nitro the server half into the server, each importing a framework the config loader must never evaluate, and the
// Module and its generated handlers name each file by its own path. Unbundled, a new runtime file ships and gains its
// `exports` entry with nothing to add by hand. A `services` file is the runtime's own: it ships, since the files beside
// It import it relatively, but it stays out of the `exports` map, so the public surface is the functions a consumer
// Calls and the `models` that type them
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode({ exportsGeneration: "none" }), {
  entry: [{ index: "src/module.ts" }, "src/runtime/**/*.ts", "!src/**/*.{bench,test,test-d}.ts"],
  exports: { exclude: ["runtime/**/services/**"] },
  root: "src",
  unbundle: true,
});

export default tsdownConfiguration;
