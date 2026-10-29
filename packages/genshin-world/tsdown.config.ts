import type { UserConfig } from "tsdown";

import { KIT_MODULE_DIRECTORY } from "#scripts/kit/constants";
import { generateCharacterKitMap } from "#scripts/kit/generateCharacterKitMap";
import { generateExports, getTsdownConfigurationVue } from "@esposter/configuration";
import { templateCompilerOptions } from "@tresjs/core";
import { mergeConfig } from "tsdown";

// `terrainTileWorker` is the terrain worker's own entry, which the app bundles as a worker, and `save`
// And `sceneExport` are the app server's, which reach none of the world's components. The parity page's shapes are what
// The tooling in `scripts` reads back off the page, so the workspace resolves them from source under `./parity/*`, and
// The published map, which ships no page, never carries the arm
// The `build:prepare` hook replaces the base's rather than joining it, so it writes the barrels the base writes, and
// Writes the kit map first, so the barrel lists it on a fresh clone too. The barrel leaves the kit modules out, since
// The kit map loads each through an `import()` of its own as its character joins the party
// The Traveler's game model is loaded on demand in development, so the barrel leaves its modules out and they stay a chunk
const AVATAR_MODULE_DIRECTORY = "services/character/avatar";
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationVue(templateCompilerOptions), {
  entry: {
    index: "src/index.ts",
    save: "src/save.ts",
    sceneExport: "src/sceneExport.ts",
    terrainTileWorker: "src/workers/terrainTile.worker.ts",
  },
  exports: {
    customExports: (exports, { isPublish }) =>
      isPublish ? exports : { ...exports, "./parity/*": { source: "./parity/*.ts" } },
  },
  hooks: {
    "build:prepare": ({ options: { cwd } }) => {
      generateCharacterKitMap(cwd);
      generateExports(cwd, "vue", [KIT_MODULE_DIRECTORY, AVATAR_MODULE_DIRECTORY]);
    },
  },
});

export default tsdownConfiguration;
