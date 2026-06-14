import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "./src/getVitestConfiguration";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration();

export default vitestConfiguration;
