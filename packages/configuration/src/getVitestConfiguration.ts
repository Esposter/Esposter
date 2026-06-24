import type { ViteUserConfig } from "vitest/config";

import { getBenchmarkPlugins } from "./getBenchmarkPlugins";

export const getVitestConfiguration = (): ViteUserConfig => ({
  plugins: getBenchmarkPlugins(),
  resolve: {
    tsconfigPaths: true,
  },
  // Reporter referenced by path string, not import: configuration builds before shared-node. Vitest
  // resolves it (consumer-side, bench mode only) to shared-node's `./reporter` default export, which writes
  // colocated per-file results. Packages that bench need `@esposter/shared-node` as a devDependency.
  test: {
    benchmark: { reporters: ["@esposter/shared-node/reporter"] },
    hookTimeout: 60_000,
  },
});
