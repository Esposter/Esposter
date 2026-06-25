import type { ViteUserConfig } from "vitest/config";

import { getBenchmarkPlugins } from "./getBenchmarkPlugins";
import { getBenchmarkRunner } from "./getBenchmarkRunner";

export const getVitestConfiguration = (): ViteUserConfig => ({
  plugins: getBenchmarkPlugins(),
  resolve: {
    tsconfigPaths: true,
  },
  // Reporter referenced by path string, not import: configuration builds before shared-node. Vitest
  // Resolves it (consumer-side, bench mode only) to shared-node's `./reporter` default export, which writes
  // Colocated per-file results. Packages that bench need `@esposter/shared-node` as a devDependency.
  test: {
    benchmark: { reporters: ["@esposter/shared-node/reporter"] },
    hookTimeout: 60_000,
    // Custom benchmark runner (bench mode only — see getBenchmarkRunner) that zeroes tinybench's time budget
    // So benches run a fixed iteration count, keeping the committed `*.bench.md` sample counts machine-stable.
    runner: getBenchmarkRunner(),
  },
});
