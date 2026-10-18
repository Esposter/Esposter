import { MaterialType } from "genshin-world";

// The game's material table in the dump beside its text maps
export const MATERIAL_TABLE_NAME = "MaterialExcelConfigData";
// The use a row names when using its item adds an item to the bag, so the consumable is itself an item the bag shows
export const ADD_ITEM_USE_OP = "ITEM_USE_ADD_ITEM";
// The bag's tab for a table type the bag has no tab of its own for: the batch-use consumables are filed with the consume
export const BAG_TAB_BY_TABLE_TYPE: Partial<Record<string, MaterialType>> = {
  MATERIAL_CONSUME_BATCH_USE: MaterialType.Consume,
};
