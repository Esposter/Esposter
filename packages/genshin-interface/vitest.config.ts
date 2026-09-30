import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { configDefaults } from "vitest/config";

// A `*.visual.ts` runs in the browser suite alone (`vitest.browser.config.ts`)
const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname, {
  exclude: [...configDefaults.exclude, "**/*.visual.ts"],
});

export default vitestConfiguration;
