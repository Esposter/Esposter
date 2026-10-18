import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { checkIsCookingRecipeOpen } from "#src/services/cooking/checkIsCookingRecipeOpen";

// The dishes the cook can choose from at the stove: those known from the start and those learned from an instruction, in
// The table's order. Empty where none is known, and the stove then stays shut
export const listOpenCookingRecipes = (recipes: readonly CookingRecipe[], progress: CookingProgress): CookingRecipe[] =>
  recipes.filter((recipe) => checkIsCookingRecipeOpen(recipe, progress));
