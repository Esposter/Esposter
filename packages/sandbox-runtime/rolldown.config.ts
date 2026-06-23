import type { RolldownOptions } from "rolldown";

import { getRolldownConfigurationNode } from "@esposter/configuration";
// Two entrypoints: the library barrel (index) and the CLI binary (cli).
const rolldownConfigurationNode: RolldownOptions = {
  ...getRolldownConfigurationNode(),
  input: { cli: "src/cli.ts", index: "src/index.ts" },
};

export default rolldownConfigurationNode;
