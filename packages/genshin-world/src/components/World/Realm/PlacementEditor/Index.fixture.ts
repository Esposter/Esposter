import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { ENGLISH_GAME_TEXT } from "genshin-text";

const CHAIR_ITEM_ID = 1001;
const TABLE_ITEM_ID = 1002;
const SCENE_ID = 9;
const AREA_ID = 1;
const position = { x: 1, y: 0, z: 2 };
const area: HomeArea = {
  areaId: AREA_ID,
  exterior: true,
  loadLimit: 90,
  orangeLoad: 60,
  redLoad: 80,
  sceneId: SCENE_ID,
};
// A table's second copy takes its reduced load, so two tables hold 70 between them
const tablePlacement: HomePlacement = {
  areaId: AREA_ID,
  furnishingItemId: TABLE_ITEM_ID,
  position,
  rotation: 0,
  sceneId: SCENE_ID,
};

export const props = {
  area,
  furnishings: [
    { discountLoad: 10, itemId: CHAIR_ITEM_ID, load: 30 },
    { discountLoad: 20, itemId: TABLE_ITEM_ID, load: 50 },
  ] satisfies HomeFurnishing[],
  gameText: ENGLISH_GAME_TEXT,
  held: [
    { itemId: CHAIR_ITEM_ID, name: "Chair" },
    { itemId: TABLE_ITEM_ID, name: "Table" },
  ],
  placements: [] as HomePlacement[],
  position,
  rotation: 0,
};

export const variants = {
  // Two tables already placed: a chair on top would take the area to 100, past its limit of 90
  atLoad: { placements: [tablePlacement, { ...tablePlacement }] },
};
