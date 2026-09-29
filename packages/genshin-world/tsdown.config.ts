import type { UserConfig } from "tsdown";

import { getTsdownConfigurationVue } from "@esposter/configuration";
import { templateCompilerOptions } from "@tresjs/core";
import { mergeConfig } from "tsdown";

// `terrainTileWorker` is the terrain worker's own entry, which the app bundles as a worker
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationVue(templateCompilerOptions), {
  entry: { index: "src/index.ts", terrainTileWorker: "src/workers/terrainTile.worker.ts" },
});

export default tsdownConfiguration;
