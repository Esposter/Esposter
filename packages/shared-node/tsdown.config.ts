import type { UserConfig } from "tsdown";

import { ExportsGeneration, getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Each entrypoint is its own `@esposter/shared-node/<name>`: `getBenchmarkReporters` hands the reporter path to Vitest, a
// Bench file imports the run options, a download reads through the machine-wide cache, a child process imports the
// Hidden-window wrappers, and the wake check reads its records through one entry shared by its run and its gate. The
// Repository root is found through find-repository-root, read by the scripts and the mock database alike. Naming
// Them is also why no barrel is generated — nothing here is an entry for the `src/index.ts` one would produce.
const tsdownConfiguration: UserConfig = mergeConfig(
  getTsdownConfigurationNode({ exportsGeneration: ExportsGeneration.None }),
  {
    entry: {
      bench: "src/services/constants.ts",
      cache: "src/cache.ts",
      "child-process": "src/childProcess.ts",
      "find-repository-root": "src/services/findRepositoryRoot.ts",
      reporter: "src/services/BenchmarkMarkdownReporter.ts",
      "wake-check": "src/wakeCheck.ts",
    },
  },
);

export default tsdownConfiguration;
