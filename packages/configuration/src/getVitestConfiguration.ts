import type { ViteUserConfig } from "vitest/config";

export const getVitestConfiguration = (): ViteUserConfig => ({
  resolve: {
    tsconfigPaths: true,
  },
  // The reporter is referenced by path string, not import: configuration builds before shared-node, so it
  // Can't import the reporter — but a literal string stays build-first and Vitest resolves it (in the
  // Consumer, only in bench mode) to shared-node's `./reporter` default export. Consumers that bench need
  // `@esposter/shared-node` as a devDependency for the string to resolve.
  test: {
    benchmark: { outputJson: "./bench/results.json", reporters: ["@esposter/shared-node/reporter"] },
    hookTimeout: 60_000,
  },
});
