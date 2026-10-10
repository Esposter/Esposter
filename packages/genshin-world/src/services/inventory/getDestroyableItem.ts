import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { checkIsInventoryItemDestroyable } from "#src/services/inventory/checkIsInventoryItemDestroyable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag's entry with that id, which the bag must hold and may destroy, or the destruction is refused
export const getDestroyableItem = (items: InventoryItem[], id: number): InventoryItem => {
  const item = items.find((entry) => entry.id === id);
  if (!item || !checkIsInventoryItemDestroyable(item))
    throw new InvalidOperationError(Operation.Delete, getDestroyableItem.name, `${id}`);
  return item;
};
