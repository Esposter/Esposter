import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "#src/getVitestConfiguration";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname);

export default vitestConfiguration;
