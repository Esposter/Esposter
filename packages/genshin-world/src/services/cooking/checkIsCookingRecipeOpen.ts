import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

// Whether a dish is known: known from the start, or learned from one of its instructions
export const checkIsCookingRecipeOpen = (recipe: CookingRecipe, progress: CookingProgress): boolean =>
  recipe.isDefaultUnlocked || progress.learnedRecipeIds.includes(recipe.id);
