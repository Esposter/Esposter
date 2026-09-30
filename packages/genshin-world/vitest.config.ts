import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { configDefaults } from "vitest/config";

// A `*.browser.test.ts` runs in the browser suite alone (`vitest.browser.config.ts`), where its animations run
const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname, {
  exclude: [...configDefaults.exclude, "**/*.browser.test.ts"],
});

export default vitestConfiguration;
