import type { UserConfig } from "tsdown";

import { getTsdownConfigurationVue } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `constants` is the interface's pure constants, which the scripts read without its components
// `save` is the save's own entry, which the app's server loads for the wish counters' kinds without the interface's components
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationVue(), {
  entry: { constants: "src/services/constants.ts", index: "src/index.ts", save: "src/save.ts" },
});

export default tsdownConfiguration;
