import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { InventoryUseContext } from "#src/models/inventory/InventoryUseContext";

import { checkIsFragileResin } from "#src/services/inventory/checkIsFragileResin";
import { getInventoryItemLearning } from "#src/services/inventory/getInventoryItemLearning";
import { ItemCategory } from "genshin-interface";

// Whether the bag offers an entry its Use: Fragile Resin, as `useInventoryEntry` routes it, a food the dish table gives a use,
// And an item that teaches a dish, recipe or blueprint not yet open. Each kind that teaches is routed by `getInventoryItemLearning`
export const checkIsInventoryItemUsable = (item: InventoryItem, context: InventoryUseContext): boolean => {
  if (checkIsFragileResin(item)) return true;
  const learning = getInventoryItemLearning(item, context);
  if (learning !== undefined) return !learning.isOpen;
  switch (item.definition.category) {
    case ItemCategory.Food:
      return context.dishUseMap.has(item.definition.id);
    default:
      return false;
  }
};
