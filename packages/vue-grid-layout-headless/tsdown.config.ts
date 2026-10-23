import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Named by hand with exportsGeneration "none", because a generated barrel would publish the internal registry of
// Mounted grids and the constants.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration({ exportsGeneration: "none" }), {
  entry: { index: "src/vueGridLayoutHeadless.ts" },
});

export default tsdownConfiguration;
