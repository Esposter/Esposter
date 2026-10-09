import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { checkIsInventoryItemDestroyable } from "#src/services/inventory/checkIsInventoryItemDestroyable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag's entries after the entry with that id is destroyed. The bag must hold it, and it must be one the bag may
// Destroy, or the destruction is refused
export const destroyInventoryItem = (items: InventoryItem[], id: number): InventoryItem[] => {
  const item = items.find((entry) => entry.id === id);
  if (!item || !checkIsInventoryItemDestroyable(item))
    throw new InvalidOperationError(Operation.Delete, destroyInventoryItem.name, `${id}`);
  return items.filter((entry) => entry !== item);
};
