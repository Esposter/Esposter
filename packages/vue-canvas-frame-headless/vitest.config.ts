import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname, { environment: "happy-dom" });

export default vitestConfiguration;
