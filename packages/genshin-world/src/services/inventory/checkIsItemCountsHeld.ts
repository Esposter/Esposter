import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { sumItemCount } from "#src/services/inventory/sumItemCount";

// Whether the bag holds every count of a set of item counts taken `times` over at once: an item the set names more than
// Once needs the sum of its counts, as the takes that spend the set make it, so the bag must hold each item's total
export const checkIsItemCountsHeld = (items: InventoryItem[], itemCounts: ItemCount[], times: number): boolean =>
  itemCounts.every(({ id }) => countInventoryItem(items, id) >= sumItemCount(itemCounts, id) * times);
