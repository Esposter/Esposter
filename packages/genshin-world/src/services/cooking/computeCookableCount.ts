import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { COOKING_BATCH_LIMIT } from "#src/services/cooking/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { sumItemCount } from "#src/services/inventory/sumItemCount";

// How many dishes of a recipe the bag's ingredients make, at most a batch: the least of the times each ingredient's held
// Count allows at its cost per dish, an ingredient the recipe names twice costing both counts together
export const computeCookableCount = (recipe: CookingRecipe, inventory: Inventory): number =>
  recipe.ingredients.reduce(
    (count, { id }) =>
      Math.min(count, Math.floor(countInventoryItem(inventory.items, id) / sumItemCount(recipe.ingredients, id))),
    COOKING_BATCH_LIMIT,
  );
