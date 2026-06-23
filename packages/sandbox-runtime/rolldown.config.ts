import type { RolldownOptions } from "rolldown";

import { getRolldownConfigurationNode } from "@esposter/configuration";
// Two entrypoints: the library barrel (index) and the CLI binary (cli).
const rolldownConfigurationNode: RolldownOptions = {
  ...getRolldownConfigurationNode(),
  // @platformatic/vfs is a declared runtime dependency — resolve it from node_modules instead of
  // Vendoring its ~135 KB into the bundle, so the bundle-size test tracks our code, not the dep.
  external: ["@platformatic/vfs"],
  input: { cli: "src/cli.ts", index: "src/index.ts" },
};

export default rolldownConfigurationNode;
