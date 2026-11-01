import type { DishUse } from "#src/models/cooking/DishUse";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { ItemCategory } from "genshin-interface";

// Whether the bag's Use takes a chosen amount: a food whose dish heals or revives, the one kind the wiki says is used
// By selecting the amount and the character. A dish that only gives a bonus, and every other kind, is used at one
export const checkIsInventoryItemAmountable = (
  item: InventoryItem,
  dishUseMap: ReadonlyMap<number, DishUse>,
): boolean => {
  if (item.definition.category !== ItemCategory.Food) return false;
  const dishUse = dishUseMap.get(item.definition.id);
  return dishUse?.heal !== undefined || dishUse?.revive !== undefined;
};
