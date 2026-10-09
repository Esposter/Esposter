import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { learnByDiagram } from "#src/services/shared/learnByDiagram";

// The bag and progress after a recipe is learned by using one of its diagrams, the diagram taken from the bag. Undefined,
// With nothing used, where the item is not one of the recipe's diagrams, is not held, or the recipe is learned already
export const learnForgeRecipe = (
  recipe: ForgeRecipe,
  diagramItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: ForgeProgress },
): undefined | { inventory: Inventory; progress: ForgeProgress } => {
  const learned = learnByDiagram(
    { id: recipe.id, learnedIds: progress.learnedRecipeIds, unlockItemIds: recipe.unlockItemIds },
    diagramItemId,
    inventory,
  );
  return learned && { inventory: learned.inventory, progress: { ...progress, learnedRecipeIds: learned.learnedIds } };
};
