import type { DishUse } from "#src/models/cooking/DishUse";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { ItemCategory } from "genshin-interface";

// Whether the bag offers an entry its Use, routed by the entry's kind: a food the dish table gives a use is usable, and
// No other kind is yet, so each kind that gains a use adds its own case beside the food's
export const checkIsInventoryItemUsable = (item: InventoryItem, dishUseMap: ReadonlyMap<number, DishUse>): boolean => {
  switch (item.definition.category) {
    case ItemCategory.Food:
      return dishUseMap.has(item.definition.id);
    default:
      return false;
  }
};
