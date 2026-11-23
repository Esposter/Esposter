import type { UserConfig } from "tsdown";

import { KIT_MODULE_DIRECTORY } from "#scripts/kit/constants";
import { generateCharacterKitMap } from "#scripts/kit/generateCharacterKitMap";
import { tresCustomElements } from "#scripts/tres/tresCustomElements";
import { getTsdownConfigurationVue } from "@esposter/configuration";
import { generateBarrels } from "@esposter/configuration/generate-barrels";
import { mergeConfig } from "tsdown";

// `terrainTileWorker` is the terrain worker's own entry, which the app bundles as a worker, and `save` And
// `sceneExport` are the app server's, which reach none of the world's components. The parity page's shapes are what The
// Tooling in `scripts` reads back off the page, so the workspace resolves them from source under `./parity/<name>`, and
// The published map, which ships no page, never carries the arms The `build:prepare` hook replaces the base's rather
// Than joining it, so it hands `generateBarrels` its own folders, Which adds the subpath exclusions its manifest's arms
// Name. It writes the kit map first, so the barrel lists the map On a fresh clone too. The barrel leaves the kit
// Modules out, since The kit map loads each through an `import()` of its own as its character joins the party The
// Traveler's game model is loaded on demand in development, so the barrel leaves its modules out and they stay a chunk
const AVATAR_MODULE_DIRECTORY = "services/character/avatar";
// The card game's service and session, which the world's session loads on a duel's opening rather than with the world
const GCG_MODULE_DIRECTORIES = ["services/gcg", "components/Gcg"];
// Directories nothing in the repo imports from the package's barrel. The barrel leaves their modules out, so the
// The entry does not name them, and a module under one loads only when a module that reaches it does
const UNREFERENCED_MODULE_DIRECTORIES = [
  "components/Weapon",
  "composables",
  "services/weapon",
  "components/World/Realm",
  "services/home",
  "services/imaginarium",
  "services/elementalNode",
  "services/save",
  "services/combat",
  "services/party",
  "services/spiralAbyss",
  "services/bosses",
  "services/enemy",
  "services/cooking",
  "services/fishing",
  "services/fontaine",
  "services/leyLine",
  "services/originalResin",
  "services/liyue",
  "services/expedition",
  "services/gadget",
  "services/chest",
  "services/inazuma",
  "services/mondstadt",
  "models/witness",
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
      generateBarrels(cwd, [
        KIT_MODULE_DIRECTORY,
        AVATAR_MODULE_DIRECTORY,
        ...GCG_MODULE_DIRECTORIES,
        ...UNREFERENCED_MODULE_DIRECTORIES,
      ]);
    },
  },
});

export default tsdownConfiguration;
