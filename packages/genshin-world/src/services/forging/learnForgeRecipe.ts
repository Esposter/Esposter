import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { learnByDiagramInProgress } from "#src/services/shared/learnByDiagramInProgress";

// The bag and progress after a recipe is learned by using one of its diagrams, the diagram taken from the bag.
// Undefined, with nothing used, where the item is not one of the recipe's diagrams, is not held, or the recipe is
// Learned already
export const learnForgeRecipe = (
  recipe: ForgeRecipe,
  diagramItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: ForgeProgress },
): { inventory: Inventory; progress: ForgeProgress } | undefined =>
  learnByDiagramInProgress(recipe, diagramItemId, { inventory, progress }, "learnedRecipeIds");
