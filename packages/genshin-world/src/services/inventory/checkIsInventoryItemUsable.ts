import type { DishUse } from "#src/models/cooking/DishUse";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { FRAGILE_RESIN_ITEM_ID } from "#src/services/originalResin/constants";
import { ItemCategory } from "genshin-interface";

// Whether the bag offers an entry its Use: Fragile Resin by its id, as `useInventoryEntry` routes it, and a food the dish
// Table gives a use. No other kind is yet, so each kind that gains a use adds its own case beside the food's
export const checkIsInventoryItemUsable = (item: InventoryItem, dishUseMap: ReadonlyMap<number, DishUse>): boolean => {
  if (item.definition.id === FRAGILE_RESIN_ITEM_ID) return true;
  switch (item.definition.category) {
    case ItemCategory.Food:
      return dishUseMap.has(item.definition.id);
    default:
      return false;
  }
};
