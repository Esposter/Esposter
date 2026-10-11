import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// The API is the one file that names what a consumer imports, so the build writes no barrel: every module with an
// Export would otherwise be public, and the reader's services with them.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration({ exportsGeneration: "none" }), {
  entry: { index: "src/api.ts" },
});

export default tsdownConfiguration;
