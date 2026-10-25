import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "#src/services/getVitestConfiguration";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname);

export default vitestConfiguration;
