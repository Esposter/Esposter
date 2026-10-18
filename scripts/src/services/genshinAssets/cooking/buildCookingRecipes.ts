import type { CookingRecipe } from "genshin-world";

import { GameDataset } from "genshin-world";

// The dishes from the game's cook recipe table, each with its specialties and the instruction items that teach it, sorted
// By id as the recipes record of the cooking dataset
export const buildCookingRecipes = (recipes: CookingRecipe[]): Record<string, unknown> => ({
  [`${GameDataset.Cooking}/recipes`]: recipes,
});
