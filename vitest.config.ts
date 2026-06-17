import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { defineConfig } from "vitest/config";

const baseVitestConfiguration = getVitestConfiguration();
const vitestConfiguration: ViteUserConfig = defineConfig({
  ...baseVitestConfiguration,
  test: {
    ...baseVitestConfiguration.test,
    projects: [
      "packages/*",
      // The root `scripts/` suite is not a workspace package, so it needs its own project entry;
      // `extends: true` inherits this file's shared base (tsconfig paths, hook timeout).
      { extends: true, test: { include: ["scripts/**/*.test.ts"], name: "scripts" } },
    ],
  },
});

export default vitestConfiguration;
