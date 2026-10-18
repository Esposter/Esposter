import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Both entries are named here, so no barrel is generated: the build deletes any `src/index.ts` it does not generate, so
// The main entry takes its own name, and `placement` is the pure functions alone for a consumer that places cells
// Without the composable's Vue state.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration({ exportsGeneration: "none" }), {
  entry: { index: "src/vueGridLayoutHeadless.ts", placement: "src/placement.ts" },
});

export default tsdownConfiguration;
