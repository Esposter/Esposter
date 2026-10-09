import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// The bag's entries after `times` of a set of item counts are taken out of it, each item taking its count for every time.
// The bag must hold every one, or the take is refused by the take it is made of
export const takeItemCounts = (items: InventoryItem[], itemCounts: ItemCount[], times: number): InventoryItem[] =>
  itemCounts.reduce((bagItems, { count, id }) => takeInventoryItems(bagItems, id, count * times), items);
