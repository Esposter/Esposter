import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";
// The reporter and runner are the package's only entrypoints, each reachable as its own
// `@esposter/shared-node/<name>` default export: those paths are what `getVitestConfiguration` and
// `getBenchmarkRunner` hand to Vitest, which imports them only in bench mode.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  entry: { reporter: "src/services/BenchmarkMarkdownReporter.ts", runner: "src/services/StableBenchmarkRunner.ts" },
});

export default tsdownConfiguration;
