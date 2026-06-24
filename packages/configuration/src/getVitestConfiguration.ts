import type { ViteUserConfig } from "vitest/config";

import codspeedPlugin from "@codspeed/vitest-plugin";

// CodSpeed's plugin instruments `bench()` for the hosted dashboard (CPU/cache simulation, walltime,
// Memory + flamegraphs). It is only wired when the CodSpeed runner is driving the run — `CODSPEED_ENV` is
// Set by `CodSpeedHQ/action` in CI — so local `pnpm bench` stays the plain tinybench path that the
// Colocated reporter renders into the committed `*.bench.md`. Gating the import this way also keeps the
// Plugin's bench-mode side effects (forks pool, profiling v8 flags, globalSetup) out of local runs.
export const getVitestConfiguration = (): ViteUserConfig => ({
  plugins: process.env.CODSPEED_ENV === undefined ? [] : [codspeedPlugin()],
  resolve: {
    tsconfigPaths: true,
  },
  // The reporter is referenced by path string, not import: configuration builds before shared-node, so it
  // Can't import the reporter — but a literal string stays build-first and Vitest resolves it (in the
  // Consumer, only in bench mode) to shared-node's `./reporter` default export. Consumers that bench need
  // `@esposter/shared-node` as a devDependency for the string to resolve. No `outputJson`: the reporter
  // Writes colocated per-file results (Foo.bench.json + Foo.bench.md) from the in-memory run, not one
  // Merged file. Under CodSpeed (CODSPEED_ENV set) the reporter short-circuits — results go to the
  // Dashboard, not the committed artifacts.
  test: {
    benchmark: { reporters: ["@esposter/shared-node/reporter"] },
    hookTimeout: 60_000,
  },
});
