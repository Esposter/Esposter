import type { UserConfig } from "vite";

import { defineConfig } from "vitest/config";

const vitestConfiguration: UserConfig = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
});

export default vitestConfiguration;
