import type { ViteUserConfig } from "vitest/config";

import { getBenchmarkPlugins } from "./getBenchmarkPlugins";

export const getVitestConfiguration = (): ViteUserConfig => ({
  // CodSpeed bench instrumentation for the hosted dashboard, only under the CodSpeed runner (CI); inert
  // Locally. See getBenchmarkPlugins. The app wires the same helper inline since it skips this function.
  plugins: getBenchmarkPlugins(),
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
