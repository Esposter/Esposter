import type { ViteUserConfig } from "vitest/config";

import { defaultServerConditions } from "vite";

import { SOURCE_CONDITION } from "./constants.ts";
// Extension-ful relative imports on this path only: Vite's native config loader reads it while resolving a
// Consumer's vitest.config.ts and warns on every extensionless specifier it has to guess at.
import { getBenchmarkTestConfiguration } from "./getBenchmarkTestConfiguration.ts";

export const getVitestConfiguration = (): ViteUserConfig => ({
  resolve: {
    // Opts into the arm a workspace package exports its own TypeScript under, so a test runs against a
    // Sibling's source rather than whatever its `dist` happened to hold when it was last built. Vite's own
    // Defaults are spread back in because this field replaces them rather than adding to it — dropping
    // `module` and `node` silently re-resolves half the dependency tree.
    conditions: [SOURCE_CONDITION, ...defaultServerConditions],
    tsconfigPaths: true,
  },
  test: {
    ...getBenchmarkTestConfiguration(),
    hookTimeout: 60_000,
    // Restores every vi.stubEnv after the test that set it, so no file needs its own unstubAllEnvs teardown.
    // The globals equivalent stays off: a beforeAll stubGlobal is restored after the first test, not the file.
    unstubEnvs: true,
  },
});
