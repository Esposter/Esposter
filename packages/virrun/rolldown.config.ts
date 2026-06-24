import type { RolldownOptions } from "rolldown";

import { getRolldownConfigurationNode } from "@esposter/configuration";
// Two entrypoints: the library barrel (index) and the CLI binary (cli).
const rolldownConfigurationNode: RolldownOptions = {
  ...getRolldownConfigurationNode(),
  // Fully self-contained CLI/library bundle: vendor everything (incl. @esposter/*, zod, @platformatic/vfs
  // And the vue framework peers) so consumers `npm i virrun` with zero transitive deps. The harmless
  // @vueuse/core INVALID_ANNOTATION ("comment ignored due to position") parse warnings are tolerated —
  // The alternative (externalizing vue) would force consumers to install peer deps.
  external: [],
  input: { cli: "src/cli.ts", index: "src/index.ts" },
};

export default rolldownConfigurationNode;
