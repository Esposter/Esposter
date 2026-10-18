import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";

// Whether the bag holds every count of a set of item counts at once: an item the set names more than once needs the sum
// Of its counts, as the takes that spend the set make it, so the bag must hold each item's total
export const checkIsItemCountsHeld = (items: InventoryItem[], itemCounts: ItemCount[]): boolean =>
  itemCounts.every(
    ({ id }) =>
      countInventoryItem(items, id) >=
      itemCounts.reduce((total, itemCount) => (itemCount.id === id ? total + itemCount.count : total), 0),
  );
