import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";

// The module adds each canvas component by its resolved path, so neither needs an `exports` arm.
const tsdownConfiguration: UserConfig = getTsdownConfigurationNuxtModule([
  "runtime/TresCanvas.client",
  "runtime/TresCanvas.server",
]);

export default tsdownConfiguration;
