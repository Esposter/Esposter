import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { GatheringRespawn } from "genshin-world";
import { join } from "node:path";

// The game's gather table in the dump beside its material table
export const GATHER_TABLE_FILENAME = "GatherExcelConfigData.json";
// The gather rows that are picked off the ground: the animals' and events' rows save nothing and sit on no point
export const GATHER_POINT_LOCATION_GROUND = "POINT_GROUND";
export const GATHER_SAVE_TYPE_NONE = "GATHER_SAVE_TYPE_NONE";
// The official map's top-level labels of the three categories a gathering point is marked under, Local Specialties,
// Inventory / Materials and Ores. An ore is struck until it breaks rather than picked, so its points are written beside
// The rest and the world strikes them
const LOCAL_SPECIALTIES_LABEL_ID = 10;
const INVENTORY_MATERIALS_LABEL_ID = 60;
// How each category comes back once picked, as the wiki gives it: a local specialty after its duration, and a cooking
// Ingredient at the game's midnight that follows the pick
export const CATEGORY_RESPAWN_MAP: Record<number, GatheringRespawn> = {
  [INVENTORY_MATERIALS_LABEL_ID]: GatheringRespawn.Daily,
  [LOCAL_SPECIALTIES_LABEL_ID]: GatheringRespawn.Specialty,
};
// The labels whose points come back on their own rule rather than their category's, as the wiki's Reset page gives
// Them: an Iron Chunk at the game's midnight, a White Iron Chunk or Starsilver two days after, and a Crystal Chunk,
// Amethyst Lump or Condessence Crystal (which the Reset page does not name) three days after. A Magical Crystal Chunk is
// A mining outcrop, drawn daily by its own place rule, and a Scarlet Quartz, Rainbowdrop Crystal or Electro Crystal (a
// Tourmaline shattered by Pyro) has no poise requirement on the Mineral page, so none is written
export const LABEL_RESPAWN_MAP: Record<number, GatheringRespawn> = {
  // White Iron Chunk
  15: GatheringRespawn.TwoDays,
  // Crystal Chunk
  16: GatheringRespawn.ThreeDays,
  // Starsilver
  139: GatheringRespawn.TwoDays,
  // Iron Chunk
  172: GatheringRespawn.Daily,
  // Amethyst Lump
  202: GatheringRespawn.ThreeDays,
  // Condessence Crystal
  507: GatheringRespawn.ThreeDays,
};
// Where the gathering slices are written, one per region, and the items they give, in the world's generated folder
export const GATHERING_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "gathering",
);
export const GATHERING_ITEMS_PATH: string = join(GATHERING_GENERATED_DIRECTORY, "items.json");
