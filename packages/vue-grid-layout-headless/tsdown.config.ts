import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Both entries are named by hand with exportsGeneration "none", because a generated barrel would publish the internal
// Registry of mounted grids and the constants. `placement` holds the pure functions alone, for a consumer that places
// Cells without the composable's Vue state.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration({ exportsGeneration: "none" }), {
  entry: { index: "src/vueGridLayoutHeadless.ts", placement: "src/placement.ts" },
});

export default tsdownConfiguration;
