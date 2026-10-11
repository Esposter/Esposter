import type { UserConfig } from "tsdown";

import { generateCharacterKitMap } from "#scripts/kit/generateCharacterKitMap";
import { generateExports, getTsdownConfigurationVue } from "@esposter/configuration";
import { templateCompilerOptions } from "@tresjs/core";
import { mergeConfig } from "tsdown";

// `terrainTileWorker` is the terrain worker's own entry, which the app bundles as a worker, and `save` and
// `characterPack` are the app server's, which reach none of the world's components. The parity page's shapes
// Are what the tooling in `scripts` reads back off the page, so the workspace resolves them from source under
// `./parity/*`, and the published map, which ships no page, never carries the arm
// The `build:prepare` hook replaces the base's rather than joining it, so it writes the barrels the base writes, and
// Writes the kit map first, so the barrel lists it on a fresh clone too
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
  hooks: {
    "build:prepare": ({ options: { cwd } }) => {
      generateCharacterKitMap(cwd);
      generateExports(cwd, "vue");
    },
  },
});

export default tsdownConfiguration;
