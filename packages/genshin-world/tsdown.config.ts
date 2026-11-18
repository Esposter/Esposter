import type { UserConfig } from "tsdown";

import { KIT_MODULE_DIRECTORY } from "#scripts/kit/constants";
import { generateCharacterKitMap } from "#scripts/kit/generateCharacterKitMap";
import { tresCustomElements } from "#scripts/tres/tresCustomElements";
import { ExportsGeneration, generateExports, getTsdownConfigurationVue } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `terrainTileWorker` is the terrain worker's own entry, which the app bundles as a worker, and `save`
// And `sceneExport` are the app server's, which reach none of the world's components. The parity page's shapes are what
// The tooling in `scripts` reads back off the page, so the workspace resolves them from source under `./parity/<name>`, and
// The published map, which ships no page, never carries the arms
// The `build:prepare` hook replaces the base's rather than joining it, so it writes the barrels the base writes, and
// Writes the kit map first, so the barrel lists it on a fresh clone too. The barrel leaves the kit modules out, since
// The kit map loads each through an `import()` of its own as its character joins the party
// The Traveler's game model is loaded on demand in development, so the barrel leaves its modules out and they stay a chunk
const AVATAR_MODULE_DIRECTORY = "services/character/avatar";
// The card game's service and session, which the world's session loads on a duel's opening rather than with the world
const GCG_MODULE_DIRECTORIES = ["services/gcg", "components/Gcg"];
// Directories nothing in the repo imports from the package's barrel. The barrel leaves their modules out, so the
// entry does not name them, and a module under one loads only when a module that reaches it does
const UNREFERENCED_MODULE_DIRECTORIES = [
  "components/Weapon",
  "composables",
  "services/weapon",
  "components/World/Realm",
  "services/home",
];
// The parity page's modules the tooling in `scripts` imports as types. The page writes to `window` when it loads, so
// No wildcard reaches its modules
const PARITY_EXPORT_NAMES = [
  "models/LoadBench",
  "models/SceneBench",
  "models/SceneFog",
  "models/SceneLights",
  "models/SceneLightShares",
  "models/witness/WitnessClaim",
  "models/witness/WitnessPart",
  "models/witness/WitnessView",
  "setSceneCloudLayer",
];
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationVue({ customElements: tresCustomElements }), {
  entry: {
    index: "src/index.ts",
    save: "src/save.ts",
    sceneExport: "src/sceneExport.ts",
    terrainTileWorker: "src/workers/terrainTile.worker.ts",
  },
  exports: {
    customExports: (exports, { isPublish }) =>
      isPublish
        ? exports
        : {
            ...exports,
            ...Object.fromEntries(
              PARITY_EXPORT_NAMES.map((name) => [`./parity/${name}`, { source: `./parity/${name}.ts` }]),
            ),
          },
  },
  hooks: {
    "build:prepare": async ({ options: { cwd } }) => {
      await generateCharacterKitMap(cwd);
      generateExports(cwd, ExportsGeneration.Vue, [
        KIT_MODULE_DIRECTORY,
        AVATAR_MODULE_DIRECTORY,
        ...GCG_MODULE_DIRECTORIES,
        ...UNREFERENCED_MODULE_DIRECTORIES,
      ]);
    },
  },
});

export default tsdownConfiguration;
