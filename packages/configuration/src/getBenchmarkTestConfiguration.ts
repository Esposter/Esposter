import type { ViteUserConfig } from "vitest/config";

import { getBenchmarkRunner } from "#src/getBenchmarkRunner";
// The bench wiring on its own, because `defineVitestProject` (the app) builds its Vitest config from scratch
// And so can't take `getVitestConfiguration` — it spreads this instead of restating the fields.
export const getBenchmarkTestConfiguration = (): NonNullable<ViteUserConfig["test"]> => ({
  // Referenced by path string, not import: configuration builds before shared-node. Vitest resolves it
  // (consumer-side, bench mode only) to shared-node's `./reporter` default export, which writes colocated
  // Per-file results. Packages that bench need `@esposter/shared-node` as a devDependency.
  benchmark: { reporters: ["@esposter/shared-node/reporter"] },
  // Custom benchmark runner (bench mode only — see getBenchmarkRunner) that zeroes tinybench's time budget
  // So benches run a fixed iteration count, keeping the committed `*.bench.md` sample counts machine-stable.
  runner: getBenchmarkRunner(),
});
