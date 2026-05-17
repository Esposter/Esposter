import type { ViteUserConfig } from "vitest/config";

const vitestConfiguration: ViteUserConfig = {
  resolve: {
    tsconfigPaths: true,
  },
};

export default vitestConfiguration;
