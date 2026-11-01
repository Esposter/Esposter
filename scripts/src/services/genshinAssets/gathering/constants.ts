import { GatheringRespawn } from "genshin-world";

// The game's gather table in the dump beside its material table
export const GATHER_TABLE_NAME = "GatherExcelConfigData";
// The gather rows that are picked off the ground: the animals' and events' rows save nothing and sit on no point. Both
// Are the enum's first values, which the dump leaves out of a row, so a row with neither field is picked off the ground
// And saves nothing
export const GATHER_POINT_LOCATION_GROUND = "POINT_GROUND";
export const GATHER_SAVE_TYPE_NONE = "GATHER_SAVE_TYPE_NONE";
// The material type a material row holds when the dump leaves its type out, the table's first value. It names no type the
// World holds, so the item is left out
export const MATERIAL_TYPE_NONE = "MATERIAL_NONE";
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
// Them: an Iron Chunk at the game's midnight, a White Iron Chunk, Starsilver or Electro Crystal two days after, and a
// Crystal Chunk, Amethyst Lump or Condessence Crystal (which the Reset page does not name) three days after. A Magical
// Crystal Chunk is a mining outcrop, drawn daily by its own place rule, and a Scarlet Quartz or Rainbowdrop Crystal
// Has no poise requirement on the Mineral page, so none is written
export const LABEL_RESPAWN_MAP: Record<number, GatheringRespawn> = {
  // White Iron Chunk
  15: GatheringRespawn.TwoDays,
  // Crystal Chunk
  16: GatheringRespawn.ThreeDays,
  // Electro Crystal
  63: GatheringRespawn.TwoDays,
  // Starsilver
  139: GatheringRespawn.TwoDays,
  // Iron Chunk
  172: GatheringRespawn.Daily,
  // Amethyst Lump
  202: GatheringRespawn.ThreeDays,
  // Condessence Crystal
  507: GatheringRespawn.ThreeDays,
};
// The ground items the builder leaves out, each with its reason. An item left out for a label or a material type the
// World does not name is refused unless it is listed here, so no item goes missing without a name
export const GATHER_EXCLUDED_ITEM_IDS: ReadonlySet<number> = new Set([
  // A poise exclusion: the Mineral page's Breaking Ores table does not list Scarlet Quartz
  101005,
  // A poise exclusion: the Mineral page's Breaking Ores table does not list Rainbowdrop Crystal
  101010,
  // Its official label is the singular, "Rukkhashava Mushroom", which the name match does not reach
  101213,
  // A Quest Item, which the world holds no material type for, and which the official map labels no point of
  121183,
]);
