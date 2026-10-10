import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { configDefaults } from "vitest/config";

// A `*.browser.test.ts` runs in the browser suite alone (`vitest.browser.config.ts`), where its animations run. Every
// Suite reads the hosted game data through the mirror's fetch route
const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname, {
  exclude: [...configDefaults.exclude, "**/*.browser.test.ts"],
  setupFiles: ["./scripts/gameData/mirror/setupGameDataFetch.ts"],
});

export default vitestConfiguration;
