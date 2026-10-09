import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { checkCanCookWith } from "#src/services/cooking/checkCanCookWith";
import { checkIsCookingRecipeOpen } from "#src/services/cooking/checkIsCookingRecipeOpen";
import { computeCookableCount } from "#src/services/cooking/computeCookableCount";
import { pickDishItemId } from "#src/services/cooking/pickDishItemId";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";

// The bag after Auto Cook makes as many dishes as its ingredients allow, up to the batch limit, every one Delicious. It
// Needs the dish's proficiency full, and once begun it is made whole, so it is refused where the bag has no room for every
// Dish. Each dish rolls its character's special dish once, from `random`
export const autoCookRecipe = (
  recipe: CookingRecipe,
  {
    avatarId,
    getDefinition,
    inventory,
    progress,
    random,
  }: {
    avatarId: number;
    getDefinition: (itemId: number) => ItemDefinition;
    inventory: Inventory;
    progress: CookingProgress;
    random: () => number;
  },
): Inventory | undefined => {
  const count = computeCookableCount(recipe, inventory);
  if (
    !checkIsCookingRecipeOpen(recipe, progress) ||
    !checkCanCookWith(avatarId) ||
    (progress.proficiencies[recipe.id] ?? 0) < recipe.maxProficiency ||
    count < 1
  )
    return undefined;
  const itemIds = Array.from({ length: count }, () =>
    pickDishItemId(recipe, CookingQuality.Delicious, avatarId, random()),
  );
  return [...Map.groupBy(itemIds, (itemId) => itemId)].reduce<Inventory | undefined>(
    (bag, [itemId, group]) => {
      if (!bag) return undefined;
      const addition = addInventoryItem(bag, getDefinition(itemId), group.length);
      return addition.overflow > 0 ? undefined : addition.inventory;
    },
    { items: takeItemCounts(inventory.items, recipe.ingredients, count), nextId: inventory.nextId },
  );
};
