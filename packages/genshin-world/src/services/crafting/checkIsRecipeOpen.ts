import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

// Whether a recipe is offered to a player of this Adventure Rank: the rank reached, and, for a recipe an instruction
// Opens, that recipe learned from one
export const checkIsRecipeOpen = (recipe: CraftingRecipe, progress: CraftingProgress, adventureRank: number): boolean =>
  adventureRank >= recipe.playerLevel &&
  (recipe.unlockItemIds.length === 0 || progress.learnedRecipeIds.includes(recipe.id));
