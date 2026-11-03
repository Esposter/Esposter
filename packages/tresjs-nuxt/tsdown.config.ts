import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";

// The module adds each canvas component by its resolved path, so neither needs an `exports` arm, and nothing outside the
// Package imports its constants by the specifier.
const tsdownConfiguration: UserConfig = getTsdownConfigurationNuxtModule([
  "runtime/TresCanvas.client",
  "runtime/TresCanvas.server",
  "runtime/constants",
]);

export default tsdownConfiguration;
