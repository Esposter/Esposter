import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";

const baseVitestConfiguration = getVitestConfiguration();
// GlobalSetup runs a single teardown that drops the warm snapshot the heavy acceptance/equivalence tests share
// (captured lazily into getAcceptanceCacheHome). No single test file owns the shared snapshot, so cleanup lives
// Here; setup is a no-op so unit-only runs never pay a capture. See vitest.globalSetup.ts. Vitest resolves a
// Relative globalSetup path against this config's directory, so a plain "./" path needs no fileURLToPath dance.
const vitestConfiguration: ViteUserConfig = {
  ...baseVitestConfiguration,
  test: {
    ...baseVitestConfiguration.test,
    // Color is decided by these two env vars, read off the ambient process, so a dev shell exporting either one
    // Repaints every CLI line the format tests assert on. Empty is the neutral value the function treats as
    // Unset, leaving color off (no TTY in a worker) until a test stubs FORCE_COLOR to ask for it.
    env: { FORCE_COLOR: "", NO_COLOR: "" },
    globalSetup: ["./vitest.globalSetup.ts"],
  },
};

export default vitestConfiguration;
