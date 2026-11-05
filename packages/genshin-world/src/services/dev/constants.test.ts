import type { DevSaveTables } from "#src/models/dev/DevSaveTables";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { MaterialType } from "#src/models/inventory/MaterialType";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { ENGLISH_GAME_TEXT } from "genshin-text";
import { describe } from "vitest";

// A catalogue of one region and one area, the area's outline a square round the origin, for the dev commands' places
export const DEV_CATALOGUE: Catalogue = {
  regions: [
    {
      areas: [
        {
          id: "windrise",
          layer: WorldLayer.Surface,
          name: "Windrise",
          outline: [
            { x: -100, z: -100 },
            { x: 100, z: -100 },
            { x: 100, z: 100 },
            { x: -100, z: 100 },
          ],
          subareas: [],
          subregion: "",
          weathers: [],
        },
      ],
      id: "mondstadt",
      name: "Mondstadt",
    },
  ],
};

// A statue of the seven in the area above, with the arrival a jump lands at
export const DEV_LANDMARK: StatueLandmark = {
  areaId: "windrise",
  arrival: { heightOffset: 2, position: { x: 30, z: -40 }, rotation: Math.PI / 2 },
  heightOffset: 1,
  id: "windrise-statue",
  kind: LandmarkKind.StatueOfTheSeven,
  position: { x: 0, z: 0 },
  rotation: 0,
};

// The one material the item tables hold, Crystal Core, as the game shows its name in English
export const DEV_CRYSTAL_CORE_ID = 1;
export const DEV_CRYSTAL_CORE_NAME = "Crystal Core";
const CRYSTAL_CORE_NAME_TEXT_ID = "1";

// The name tables a dev line's item is resolved against: the game's words in English and the one material above
export const DEV_ITEM_TABLES: Pick<
  DevSaveTables,
  "gameText" | "materialDataMap" | "nameText" | "reliquaryPieceEntryMap" | "weaponDataMap"
> = {
  gameText: ENGLISH_GAME_TEXT,
  materialDataMap: new Map([
    [
      DEV_CRYSTAL_CORE_ID,
      {
        id: DEV_CRYSTAL_CORE_ID,
        materialType: MaterialType.Consume,
        nameTextId: CRYSTAL_CORE_NAME_TEXT_ID,
        rank: 0,
        rarity: 1,
        stackLimit: 99,
      },
    ],
  ]),
  nameText: { [CRYSTAL_CORE_NAME_TEXT_ID]: DEV_CRYSTAL_CORE_NAME },
  reliquaryPieceEntryMap: new Map(),
  weaponDataMap: new Map(),
};

describe.todo("constants");
