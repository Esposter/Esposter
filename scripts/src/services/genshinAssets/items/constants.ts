import { RELIQUARY_TABLE_NAME, WEAPON_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { FURNITURE_TABLE_NAME } from "#src/services/genshinAssets/home/constants";
import { MaterialType } from "genshin-world";

// The game's material table in the dump beside its text maps
export const MATERIAL_TABLE_NAME = "MaterialExcelConfigData";
// The item tables of the dump, each holding its own kind of item by its id: a material is a bag item, while a weapon, a
// Furnishing or a reliquary is an item of its own table, which the bag does not hold
export const ITEM_TABLE_NAMES: readonly string[] = [
  MATERIAL_TABLE_NAME,
  WEAPON_TABLE_NAME,
  FURNITURE_TABLE_NAME,
  RELIQUARY_TABLE_NAME,
];
// The bag's tab for a table type the bag has no tab of its own for: the batch-use consumables are filed with the consume
export const BAG_TAB_BY_TABLE_TYPE: Partial<Record<string, MaterialType>> = {
  MATERIAL_CONSUME_BATCH_USE: MaterialType.Consume,
};
// The bag's tabs, each a material type the bag shows a tab for
export const BAG_MATERIAL_TYPES: string[] = Object.values(MaterialType);
