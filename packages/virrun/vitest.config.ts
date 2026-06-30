import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";
import { fileURLToPath } from "node:url";

const baseVitestConfiguration = getVitestConfiguration();
// GlobalSetup runs a single teardown that drops the warm snapshot the heavy acceptance/equivalence tests share
// (captured lazily into getAcceptanceCacheHome). No single test file owns the shared snapshot, so cleanup lives
// Here; setup is a no-op so unit-only runs never pay a capture. See vitest.globalSetup.ts.
const vitestConfiguration: ViteUserConfig = {
  ...baseVitestConfiguration,
  test: {
    ...baseVitestConfiguration.test,
    globalSetup: [fileURLToPath(new URL("vitest.globalSetup.ts", import.meta.url))],
  },
};

export default vitestConfiguration;
