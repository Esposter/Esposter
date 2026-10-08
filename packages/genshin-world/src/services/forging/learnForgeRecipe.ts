import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// The bag and progress after a recipe is learned by using one of its diagrams, the diagram taken from the bag. Undefined,
// With nothing used, where the item is not one of the recipe's diagrams, is not held, or the recipe is learned already
export const learnForgeRecipe = (
  recipe: ForgeRecipe,
  diagramItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: ForgeProgress },
): undefined | { inventory: Inventory; progress: ForgeProgress } => {
  if (
    !recipe.unlockItemIds.includes(diagramItemId) ||
    progress.learnedRecipeIds.includes(recipe.id) ||
    countInventoryItem(inventory.items, diagramItemId) < 1
  )
    return undefined;
  return {
    inventory: { items: takeInventoryItems(inventory.items, diagramItemId, 1), nextId: inventory.nextId },
    progress: { ...progress, learnedRecipeIds: [...progress.learnedRecipeIds, recipe.id] },
  };
};
