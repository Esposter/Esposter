import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// The module is the `.` entry, which Nuxt imports in Node while it reads `nuxt.config`. Every runtime file is its own
// Unbundled entry, since Nuxt and Nitro each load one by its path and must never evaluate the module's imports of Nuxt
// Itself. The `services` beside them ship for the files that import them, and stay out of the `exports` map.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode({ exportsGeneration: "none" }), {
  entry: [{ index: "src/module.ts" }, "src/runtime/**/*.ts", "!src/**/*.{bench,test,test-d}.ts", "!src/**/*.d.ts"],
  exports: { exclude: ["runtime/**/services/**"] },
  root: "src",
  unbundle: true,
});

export default tsdownConfiguration;
