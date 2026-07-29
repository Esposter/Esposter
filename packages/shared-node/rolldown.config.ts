import type { RolldownOptions } from "rolldown";

import { getRolldownConfigurationNode } from "@esposter/configuration";

const baseConfiguration = getRolldownConfigurationNode();
// The reporter and runner are the package's only entrypoints, each reachable as its own
// `@esposter/shared-node/<name>` default export: those paths are what `getVitestConfiguration` and
// `getBenchmarkRunner` hand to Vitest, which imports them only in bench mode.
const rolldownConfigurationNode: RolldownOptions = {
  ...baseConfiguration,
  input: {
    reporter: "src/services/BenchmarkMarkdownReporter.ts",
    runner: "src/services/StableBenchmarkRunner.ts",
  },
};

export default rolldownConfigurationNode;
