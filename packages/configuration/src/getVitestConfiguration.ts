import type { ViteUserConfig } from "vitest/config";

import { getBenchmarkPlugins } from "./getBenchmarkPlugins.ts";
import { getBenchmarkRunner } from "./getBenchmarkRunner.ts";

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
    // Restores every vi.stubEnv after the test that set it, so no file needs its own unstubAllEnvs teardown.
    // The globals equivalent stays off: a beforeAll stubGlobal is restored after the first test, not the file.
    unstubEnvs: true,
  },
});
