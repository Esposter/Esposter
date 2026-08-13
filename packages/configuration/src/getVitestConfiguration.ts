import type { ViteUserConfig } from "vitest/config";

// Extension-ful relative imports on this path only: Vite's native config loader reads it while resolving a
// Consumer's vitest.config.ts and warns on every extensionless specifier it has to guess at.
import { getBenchmarkTestConfiguration } from "./getBenchmarkTestConfiguration.ts";

export const getVitestConfiguration = (): ViteUserConfig => ({
  resolve: {
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
