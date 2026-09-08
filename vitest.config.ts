import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { defineConfig } from "vitest/config";

const baseVitestConfiguration = getVitestConfiguration();
const vitestConfiguration: ViteUserConfig = defineConfig({
  ...baseVitestConfiguration,
  test: {
    ...baseVitestConfiguration.test,
    // Every workspace member, as the globs `pnpm-workspace.yaml` declares them — each one configures its own
    // Project, so nothing here knows what any of them contains.
    projects: ["apps/*", "packages/*", "scripts"],
  },
});

export default vitestConfiguration;
