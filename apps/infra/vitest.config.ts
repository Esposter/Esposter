import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration();

export default vitestConfiguration;
