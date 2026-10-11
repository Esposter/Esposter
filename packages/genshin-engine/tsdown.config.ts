import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `terrainWorker` is the generators a terrain worker runs alone, so a worker importing it loads none of the renderer
// The package's own entry reaches
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration(), {
  entry: { index: "src/index.ts", terrainWorker: "src/terrainWorker.ts" },
});

export default tsdownConfiguration;
