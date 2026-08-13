import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "./src/getVitestConfiguration.ts";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration();

export default vitestConfiguration;
