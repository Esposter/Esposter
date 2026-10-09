import type { UserConfig } from "tsdown";

import { getTsdownConfigurationVue } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `save` is the save's own entry, which the app's server loads for the wish counters' kinds without the interface's components
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationVue(), {
  entry: { index: "src/index.ts", save: "src/save.ts" },
});

export default tsdownConfiguration;
