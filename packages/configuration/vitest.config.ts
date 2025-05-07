import type { UserConfig } from "vite";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const vitestConfiguration: UserConfig = defineConfig({
  plugins: [tsconfigPaths()],
});

export default vitestConfiguration;
