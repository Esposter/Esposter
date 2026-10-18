import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { DishUse } from "#src/models/cooking/DishUse";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { checkIsCookingRecipeOpen } from "#src/services/cooking/checkIsCookingRecipeOpen";
import { checkIsFragileResin } from "#src/services/inventory/checkIsFragileResin";
import { ItemCategory } from "genshin-interface";

// Whether the bag offers an entry its Use: Fragile Resin, as `useInventoryEntry` routes it, a food the dish table
// Gives a use, and an instruction whose dish is not yet open. No other kind is yet, so each kind that gains a use adds its own
// Case beside the food's
export const checkIsInventoryItemUsable = (
  item: InventoryItem,
  {
    cookingProgress,
    dishUseMap,
    instructionRecipeMap,
  }: {
    cookingProgress: CookingProgress;
    dishUseMap: ReadonlyMap<number, DishUse>;
    instructionRecipeMap: ReadonlyMap<number, CookingRecipe>;
  },
): boolean => {
  if (checkIsFragileResin(item)) return true;
  const instructionRecipe = instructionRecipeMap.get(item.definition.id);
  if (instructionRecipe !== undefined) return !checkIsCookingRecipeOpen(instructionRecipe, cookingProgress);
  switch (item.definition.category) {
    case ItemCategory.Food:
      return dishUseMap.has(item.definition.id);
    default:
      return false;
  }
};
