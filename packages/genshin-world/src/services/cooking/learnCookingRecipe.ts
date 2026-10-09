import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// The bag and progress after a dish is learned by using one of its instructions, the instruction taken from the bag.
// Undefined, with nothing used, where the item is not one of the dish's instructions, is not held, or the dish is known
export const learnCookingRecipe = (
  recipe: CookingRecipe,
  instructionItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: CookingProgress },
): undefined | { inventory: Inventory; progress: CookingProgress } => {
  if (
    !recipe.unlockItemIds.includes(instructionItemId) ||
    progress.learnedRecipeIds.includes(recipe.id) ||
    countInventoryItem(inventory.items, instructionItemId) < 1
  )
    return undefined;
  return {
    inventory: { items: takeInventoryItems(inventory.items, instructionItemId, 1), nextId: inventory.nextId },
    progress: { ...progress, learnedRecipeIds: [...progress.learnedRecipeIds, recipe.id] },
  };
};
