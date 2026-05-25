import type { ViteUserConfig } from "vitest/config";

export const getVitestConfiguration = (): ViteUserConfig => ({
  resolve: {
    tsconfigPaths: true,
  },
});
