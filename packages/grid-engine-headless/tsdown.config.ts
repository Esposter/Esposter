import type { UserConfig } from "tsdown";

import { ExportsGeneration, getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Named by hand with exportsGeneration "none", because a generated barrel would publish every step and helper the engine
// Is built from, and the package's surface is the entry alone.
const tsdownConfiguration: UserConfig = mergeConfig(
  getTsdownConfiguration({ exportsGeneration: ExportsGeneration.None }),
  { entry: { index: "src/gridEngineHeadless.ts" } },
);

export default tsdownConfiguration;
