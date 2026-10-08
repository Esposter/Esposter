import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CookingQuality } from "genshin-world";
import { join } from "node:path";

// The game's cook recipe, cook bonus and compound tables in the dump, read by their names. The material table is the
// Crafting's, read by the same name
export const COOK_RECIPE_TABLE_NAME = "CookRecipeExcelConfigData";
export const COOK_BONUS_TABLE_NAME = "CookBonusExcelConfigData";
export const COMPOUND_TABLE_NAME = "CompoundExcelConfigData";
// The use an item carries to learn the cook recipe it names as its first parameter, one item for each recipe
export const UNLOCK_COOK_RECIPE_USE_OP = "ITEM_USE_UNLOCK_COOK_RECIPE";
// The bonus type of a character's special dish, which replaces the dish cooked in its recipe at a chance
export const COOK_BONUS_REPLACE_TYPE = "COOK_BONUS_REPLACE";
// The compound type of a processing row, the one the bench's processing of ingredients is written from. A random row
// Draws its output from a drop table this build does not read, so it is left out
export const COMPOUND_COOK_TYPE = "COMPOUND_COOK";
// The quality each of a dish's results is, by the food quality its item row names
export const FoodQualityCookingQualityMap: Record<string, CookingQuality> = {
  FOOD_QUALITY_DELICIOUS: CookingQuality.Delicious,
  FOOD_QUALITY_ORDINARY: CookingQuality.Regular,
  FOOD_QUALITY_STRANGE: CookingQuality.Suspicious,
};
// Where the cooking slices are written, in the world's generated folder they are imported on demand from
export const COOKING_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "cooking",
);
export const COOKING_RECIPES_PATH: string = join(COOKING_GENERATED_DIRECTORY, "recipes.json");
export const PROCESSING_RECIPES_PATH: string = join(COOKING_GENERATED_DIRECTORY, "processing.json");
