import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";

// Every suite reads the hosted game data through the mirror's fetch route
const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname, {
  setupFiles: ["./scripts/gameData/mirror/setupGameDataFetch.ts"],
});

export default vitestConfiguration;
