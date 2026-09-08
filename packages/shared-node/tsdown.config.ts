import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";
// The reporter and the bench run options are the only entrypoints, each its own `@esposter/shared-node/<name>`:
// `getBenchmarkReporters` hands the reporter path to Vitest, and a bench file imports the run options. Naming
// Them is also why no barrel is generated — nothing here is an entry for the `src/index.ts` one would produce.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode({ exportsGeneration: "none" }), {
  entry: { bench: "src/services/constants.ts", reporter: "src/services/BenchmarkMarkdownReporter.ts" },
});

export default tsdownConfiguration;
