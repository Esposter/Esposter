import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";
// The reporter and runner are the only entrypoints, each reachable as its own `@esposter/shared-node/<name>`
// Default export: those paths are what `getVitestConfiguration` and `getBenchmarkRunner` hand to Vitest. Naming
// Them is also why no barrel is generated — nothing here is an entry for the `src/index.ts` one would produce.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode({ exportsGeneration: "none" }), {
  entry: { reporter: "src/services/BenchmarkMarkdownReporter.ts", runner: "src/services/StableBenchmarkRunner.ts" },
});

export default tsdownConfiguration;
