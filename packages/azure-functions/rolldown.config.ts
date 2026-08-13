import type { RolldownOptions } from "rolldown";

import { getCleanDistributionPlugin, getRolldownConfigurationNode } from "@esposter/configuration";
// Self-contained bundle: the Functions host installs nothing, so everything is vendored except
// `@azure/functions`, which the host itself provides. No `dts` plugin either — nothing consumes these types.
const rolldownConfiguration: RolldownOptions = {
  ...getRolldownConfigurationNode(),
  external: ["@azure/functions"],
  plugins: [getCleanDistributionPlugin()],
};

export default rolldownConfiguration;
