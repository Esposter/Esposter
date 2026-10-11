import type { UserConfig } from "tsdown";

import { getTsdownConfigurationVue } from "@esposter/configuration";
import { templateCompilerOptions } from "@tresjs/core";
import { mergeConfig } from "tsdown";

// `terrainTileWorker` is the terrain worker's own entry, which the app bundles as a worker, and `save` and
// `characterPack` are the app server's, which reach none of the world's components. The parity page's shapes
// Are what the tooling in `scripts` reads back off the page, so the workspace resolves them from source under
// `./parity/*`, and the published map, which ships no page, never carries the arm
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationVue(templateCompilerOptions), {
  entry: {
    characterPack: "src/characterPack.ts",
    index: "src/index.ts",
    save: "src/save.ts",
    terrainTileWorker: "src/workers/terrainTile.worker.ts",
  },
  exports: {
    customExports: (exports, { isPublish }) =>
      isPublish ? exports : { ...exports, "./parity/*": { source: "./parity/*.ts" } },
  },
});

export default tsdownConfiguration;
