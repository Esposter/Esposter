import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { COOKING_BATCH_LIMIT } from "#src/services/cooking/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";

// How many dishes of a recipe the bag's ingredients make, at most a batch: the least of the times each ingredient's count
// Allows, capped at the batch limit
export const computeCookableCount = (recipe: CookingRecipe, inventory: Inventory): number =>
  recipe.ingredients.reduce(
    (count, { count: perDish, id }) => Math.min(count, Math.floor(countInventoryItem(inventory.items, id) / perDish)),
    COOKING_BATCH_LIMIT,
  );
