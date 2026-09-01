import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";
// The reporter and runner are the package's only entrypoints, each reachable as its own
// `@esposter/shared-node/<name>` default export: those paths are what `getVitestConfiguration` and
// `getBenchmarkRunner` hand to Vitest, which imports them only in bench mode.
//
// Naming them is also why no barrel is generated here. Every other package builds the one entry a barrel
// Produces, and generating one for this package would leave a `src/index.ts` that nothing is an entry for.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode({ exportsGeneration: "none" }), {
  entry: { reporter: "src/services/BenchmarkMarkdownReporter.ts", runner: "src/services/StableBenchmarkRunner.ts" },
});

export default tsdownConfiguration;
