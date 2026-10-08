import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

// Whether a recipe is offered to a player of this Adventure Rank: the rank reached, and, for a recipe a diagram opens, that
// Recipe learned from one
export const checkIsForgeRecipeOpen = (recipe: ForgeRecipe, progress: ForgeProgress, adventureRank: number): boolean =>
  adventureRank >= recipe.playerLevel &&
  (recipe.unlockItemIds.length === 0 || progress.learnedRecipeIds.includes(recipe.id));
