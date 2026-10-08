import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { CookingZones } from "#src/models/cooking/CookingZones";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { checkCanCookWith } from "#src/services/cooking/checkCanCookWith";
import { checkIsCookingRecipeOpen } from "#src/services/cooking/checkIsCookingRecipeOpen";
import { computeCookableCount } from "#src/services/cooking/computeCookableCount";
import { getCookingQuality } from "#src/services/cooking/getCookingQuality";
import { pickDishItemId } from "#src/services/cooking/pickDishItemId";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";

// The bag and progress after one dish is cooked by hand, its indicator stopped at `stopPosition` on the recipe's zones:
// Its ingredients taken, the dish it makes put in the bag, and a Delicious dish adding a proficiency up to the dish's
// Maximum. Undefined, with nothing spent, where the dish is not open, the character may not cook, the bag holds no
// Ingredients, or the bag has no room for the dish
export const cookRecipeByHand = (
  recipe: CookingRecipe,
  {
    avatarId,
    getDefinition,
    inventory,
    progress,
    random,
    stopPosition,
    zones,
  }: {
    avatarId: number;
    getDefinition: (itemId: number) => ItemDefinition;
    inventory: Inventory;
    progress: CookingProgress;
    random: () => number;
    stopPosition: number;
    zones: CookingZones;
  },
): undefined | { inventory: Inventory; progress: CookingProgress } => {
  if (
    !checkIsCookingRecipeOpen(recipe, progress) ||
    !checkCanCookWith(avatarId) ||
    computeCookableCount(recipe, inventory) < 1
  )
    return undefined;
  const quality = getCookingQuality(stopPosition, zones);
  const itemId = pickDishItemId(recipe, quality, avatarId, random());
  const addition = addInventoryItem(
    { items: takeItemCounts(inventory.items, recipe.ingredients, 1), nextId: inventory.nextId },
    getDefinition(itemId),
    1,
  );
  if (addition.overflow > 0) return undefined;
  const proficiency = progress.proficiencies[recipe.id] ?? 0;
  return {
    inventory: addition.inventory,
    progress:
      quality === CookingQuality.Delicious
        ? {
            ...progress,
            proficiencies: { ...progress.proficiencies, [recipe.id]: Math.min(proficiency + 1, recipe.maxProficiency) },
          }
        : progress,
  };
};
