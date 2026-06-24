import type { RolldownOptions } from "rolldown";

import { externalVueFramework, getRolldownConfigurationNode } from "@esposter/configuration";
// Two entrypoints: the library barrel (index) and the CLI binary (cli).
const rolldownConfigurationNode: RolldownOptions = {
  ...getRolldownConfigurationNode(),
  // Self-contained CLI/library bundle: vendor everything (incl. @esposter/* and zod) so consumers need
  // No peer deps. Externalize only what shouldn't be vendored — the vue framework (never reached by this
  // Node runtime; leaving it external also keeps @vueuse/core's PURE-annotation parse warnings out) and
  // @platformatic/vfs (a declared runtime dependency, ~135 KB, resolved from node_modules).
  external: [...externalVueFramework, "@platformatic/vfs"],
  input: { cli: "src/cli.ts", index: "src/index.ts" },
};

export default rolldownConfigurationNode;
