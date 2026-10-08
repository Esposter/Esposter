import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { ForgeRecipeKind } from "genshin-world";
import { join } from "node:path";

// The game's forge table in the dump, read by its name. The material table is the crafting's, read by the same name
export const FORGE_TABLE_NAME = "ForgeExcelConfigData";
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
// Where the recipe slice is written, in the world's generated folder it is imported on demand from
export const FORGING_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "forging",
);
export const FORGING_RECIPES_PATH: string = join(FORGING_GENERATED_DIRECTORY, "recipes.json");
