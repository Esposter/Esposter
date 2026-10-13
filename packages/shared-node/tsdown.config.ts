import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Each entrypoint is its own `@esposter/shared-node/<name>`: `getBenchmarkReporters` hands the reporter path to Vitest, a
// Bench file imports the run options, and a child process imports the hidden-window wrappers. Naming them is also why no
// Barrel is generated — nothing here is an entry for the `src/index.ts` one would produce.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode({ exportsGeneration: "none" }), {
  entry: {
    bench: "src/services/constants.ts",
    "child-process": "src/childProcess.ts",
    reporter: "src/services/BenchmarkMarkdownReporter.ts",
  },
});

export default tsdownConfiguration;
