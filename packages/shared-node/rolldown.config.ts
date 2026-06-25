import type { RolldownOptions } from "rolldown";

import { getRolldownConfigurationNode } from "@esposter/configuration";

const baseConfiguration = getRolldownConfigurationNode();
// Extra entries so the reporter and runner are each reachable as their own `@esposter/shared-node/<name>`
// Default export: those paths are what `getVitestConfiguration`/`getBenchmarkRunner` hand to Vitest, which
// Imports them (default export) only in bench mode — neither goes through the named barrel.
const rolldownConfigurationNode: RolldownOptions = {
  ...baseConfiguration,
  input: {
    index: "src/index.ts",
    reporter: "src/services/BenchmarkMarkdownReporter.ts",
    runner: "src/services/StableBenchmarkRunner.ts",
  },
};

export default rolldownConfigurationNode;
