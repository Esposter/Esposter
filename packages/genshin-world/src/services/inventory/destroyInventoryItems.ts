import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { destroyInventoryItem } from "#src/services/inventory/destroyInventoryItem";

// The bag's entries after every entry with those ids is destroyed, each through `destroyInventoryItem`, so a chosen entry
// The bag may not destroy refuses the whole destruction
export const destroyInventoryItems = (items: InventoryItem[], ids: number[]): InventoryItem[] =>
  ids.reduce((remainingItems, id) => destroyInventoryItem(remainingItems, id), items);
