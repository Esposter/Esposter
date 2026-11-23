import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Each entrypoint is its own `@esposter/shared-node/<name>`: `getBenchmarkReporters` hands the reporter path to Vitest, and
// `getBenchmarkTestConfiguration` the smoke provider's, a bench file imports the run options, a download reads through the machine-wide cache, a child process imports the
// Hidden-window wrappers, and the wake check reads its records through one entry shared by its run and its gate. The
// WebSocket adapters tRPC drives are the `websocket` entry, which loads `node:events` alone, so a Worker bundle takes
// No tooling of this package. The repository root is found through find-repository-root, read by the scripts and the
// Mock database alike. Naming them is also why no barrel is generated — nothing here is an entry for the `src/index.ts` one would produce.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  entry: {
    bench: "src/services/constants.ts",
    "bench-smoke-provider": "src/services/benchmarkSmokeProvider.ts",
    cache: "src/cache.ts",
    "child-process": "src/childProcess.ts",
    "find-repository-root": "src/services/findRepositoryRoot.ts",
    reporter: "src/services/BenchmarkMarkdownReporter.ts",
    "wake-check": "src/wakeCheck.ts",
    websocket: "src/websocket.ts",
  },
});

export default tsdownConfiguration;
