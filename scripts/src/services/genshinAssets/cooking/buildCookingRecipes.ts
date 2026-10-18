import { readCookingRecipes } from "#src/services/genshinAssets/cooking/readCookingRecipes";
import { GameDataset } from "genshin-world";

// The dishes from the game's cook recipe table, each with its specialties and the instruction items that teach it, sorted
// By id as the recipes record of the cooking dataset
export const buildCookingRecipes = (): Record<string, unknown> => ({
  [`${GameDataset.Cooking}/recipes`]: readCookingRecipes(),
});
