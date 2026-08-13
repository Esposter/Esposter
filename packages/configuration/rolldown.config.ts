import type { RolldownOptions } from "rolldown";

import { getExternal } from "./src/getExternal";
import { getRolldownConfigurationNode } from "./src/getRolldownConfigurationNode";
// The one package that externalizes its `devDependencies` rather than its peers: it is private and never
// Published, its dist imports nothing but build tooling, and every workspace member that loads it already has
// That tooling installed — so declaring `rolldown`/`vite`/`vitest` as peers would only invent a contract.
const rolldownConfigurationNode: RolldownOptions = {
  ...getRolldownConfigurationNode(),
  external: getExternal("devDependencies"),
};

export default rolldownConfigurationNode;
