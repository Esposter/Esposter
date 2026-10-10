import { ForgeRecipeKind } from "genshin-world";

// The game's forge table in the dump, read by its name. The material table is the crafting's, read by the same name
export const FORGE_TABLE_NAME = "ForgeExcelConfigData";
// The game's forge random table, the items a drop-table recipe draws each unit from, read by its name
export const FORGE_RANDOM_TABLE_NAME = "ForgeRandomExcelConfigData";
// The forge random table each drop id a forge row names draws from. The dump holds no table of drop ids, so the Mystic
// Enhancement Ore's drop id is mapped to the one random table whose Mystic Enhancement Ore count is the row's own, six
export const DropIdForgeRandomIdMap: Record<number, number> = { 208_001_500: 20_001 };
// The use an item carries to learn the forge recipe it names as its first parameter: a diagram, one item for each recipe
export const UNLOCK_FORGE_USE_OP = "ITEM_USE_UNLOCK_FORGE";
// The forge type of each kind of recipe the blacksmith forges. Type eight holds the gadgets' widgets, which the gadgets page
// Owns, so it is left out here
export const ForgeTypeRecipeKindMap: Record<number, ForgeRecipeKind> = {
  1: ForgeRecipeKind.Enhancement,
  3: ForgeRecipeKind.Weapon,
  4: ForgeRecipeKind.Weapon,
  5: ForgeRecipeKind.Weapon,
  6: ForgeRecipeKind.Weapon,
  7: ForgeRecipeKind.Weapon,
};
