import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag's entries after the one of the given id is taken out, which is the copy or fodder weapon picked, so the one
// Picked is the one that leaves. The bag must hold that entry, or the take is refused
export const takeInventoryEntry = (items: InventoryItem[], entryId: number): InventoryItem[] => {
  if (!items.some((item) => item.id === entryId))
    throw new InvalidOperationError(Operation.Update, takeInventoryEntry.name, `entry ${entryId}`);
  return items.filter((item) => item.id !== entryId);
};
