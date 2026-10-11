import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { learnByDiagramInProgress } from "#src/services/shared/learnByDiagramInProgress";

// The bag and progress after a dish is learned by using one of its instructions, the instruction taken from the bag.
// Undefined, with nothing used, where the item is not one of the dish's instructions, is not held, or the dish is
// Learned already
export const learnCookingRecipe = (
  recipe: CookingRecipe,
  instructionItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: CookingProgress },
): undefined | { inventory: Inventory; progress: CookingProgress } =>
  learnByDiagramInProgress(recipe, instructionItemId, { inventory, progress }, "learnedRecipeIds");
