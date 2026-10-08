import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// The bag and progress after a recipe is learned by using one of its instructions, the instruction taken from the bag.
// Undefined, with nothing used, where the item is not one of the recipe's instructions, is not held, or the recipe is
// Learned already
export const learnCraftingRecipe = (
  recipe: CraftingRecipe,
  instructionItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: CraftingProgress },
): undefined | { inventory: Inventory; progress: CraftingProgress } => {
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
