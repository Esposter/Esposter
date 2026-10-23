import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// The module adds each canvas component by its resolved path, so neither needs an `exports` arm. mergeConfig replaces
// the factory's exclude list rather than extending it, so its services pattern is repeated here.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNuxtModule(), {
  exports: { exclude: ["runtime/**/services/**", "runtime/TresCanvas.client", "runtime/TresCanvas.server"] },
});

export default tsdownConfiguration;
