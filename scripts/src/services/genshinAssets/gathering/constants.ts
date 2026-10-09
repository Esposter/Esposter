import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { GatheringRespawn } from "genshin-world";
import { join } from "node:path";

// The game's gather table in the dump beside its material table
export const GATHER_TABLE_FILENAME = "GatherExcelConfigData.json";
// The gather rows that are picked off the ground: the animals' and events' rows save nothing and sit on no point
export const GATHER_POINT_LOCATION_GROUND = "POINT_GROUND";
export const GATHER_SAVE_TYPE_NONE = "GATHER_SAVE_TYPE_NONE";
// The official map's top-level labels of the two categories a gathering point is marked under, Local Specialties and
// Inventory / Materials. Ores are struck until they break and are not written yet, so their category is left out
const LOCAL_SPECIALTIES_LABEL_ID = 10;
const INVENTORY_MATERIALS_LABEL_ID = 60;
// How each category comes back once picked, as the wiki gives it: a local specialty after its duration, and a cooking
// Ingredient at the game's midnight that follows the pick
export const CATEGORY_RESPAWN_MAP: Record<number, GatheringRespawn> = {
  [INVENTORY_MATERIALS_LABEL_ID]: GatheringRespawn.Daily,
  [LOCAL_SPECIALTIES_LABEL_ID]: GatheringRespawn.Specialty,
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
