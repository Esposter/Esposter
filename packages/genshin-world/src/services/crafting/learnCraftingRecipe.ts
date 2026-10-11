import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { learnByDiagramInProgress } from "#src/services/shared/learnByDiagramInProgress";

// The bag and progress after a recipe is learned by using one of its instructions, the instruction taken from the bag.
// Undefined, with nothing used, where the item is not one of the recipe's instructions, is not held, or the recipe is
// Learned already
export const learnCraftingRecipe = (
  recipe: CraftingRecipe,
  instructionItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: CraftingProgress },
): undefined | { inventory: Inventory; progress: CraftingProgress } =>
  learnByDiagramInProgress(recipe, instructionItemId, { inventory, progress }, "learnedRecipeIds");
