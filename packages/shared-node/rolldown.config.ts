import type { RolldownOptions } from "rolldown";

import { getRolldownConfigurationNode } from "@esposter/configuration";

const baseConfiguration = getRolldownConfigurationNode();
// Second entry so the reporter is reachable as the `@esposter/shared-node/reporter` default export: that
// Path is what `getVitestConfiguration` puts in `benchmark.reporters`, and Vitest imports it (default
// Export) only in bench mode — it never goes through the named barrel.
const rolldownConfigurationNode: RolldownOptions = {
  ...baseConfiguration,
  input: { index: "src/index.ts", reporter: "src/services/BenchmarkMarkdownReporter.ts" },
};

export default rolldownConfigurationNode;
