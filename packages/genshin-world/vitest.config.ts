import type { ViteUserConfig } from "vitest/config";

import { screenNamesPlugin } from "#parity/screenNamesPlugin";
import { getVitestConfiguration } from "@esposter/configuration";

// Every suite reads the hosted game data through the mirror's fetch route
const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname, {
  setupFiles: ["./scripts/gameData/mirror/setupGameDataFetch.ts"],
});

// The parity page's screen names, which its test reads as the page does
export default { ...vitestConfiguration, plugins: [screenNamesPlugin] };
