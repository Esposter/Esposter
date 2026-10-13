import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Each entrypoint is its own `@esposter/shared-node/<name>`: `getBenchmarkReporters` hands the reporter path to Vitest, a
// Bench file imports the run options, a download reads through the machine-wide cache, and a child process imports the
// Hidden-window wrappers. Naming them is also why no barrel is generated — nothing here is an entry for the
// `src/index.ts` one would produce.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode({ exportsGeneration: "none" }), {
  entry: {
    bench: "src/services/constants.ts",
    cache: "src/cache.ts",
    "child-process": "src/childProcess.ts",
    reporter: "src/services/BenchmarkMarkdownReporter.ts",
  },
});

export default tsdownConfiguration;
