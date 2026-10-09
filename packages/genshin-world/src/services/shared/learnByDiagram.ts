import type { Inventory } from "#src/models/inventory/Inventory";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// The bag and learned ids after a thing is learned by using one of its diagrams, the diagram taken from the bag. Undefined,
// With nothing used, where the item is not one of its diagrams, is not held, or it is learned already
export const learnByDiagram = (
  { id, learnedIds, unlockItemIds }: { id: number; learnedIds: number[]; unlockItemIds: number[] },
  diagramItemId: number,
  inventory: Inventory,
): undefined | { inventory: Inventory; learnedIds: number[] } => {
  if (
    !unlockItemIds.includes(diagramItemId) ||
    learnedIds.includes(id) ||
    countInventoryItem(inventory.items, diagramItemId) < 1
  )
    return undefined;
  return {
    inventory: { items: takeInventoryItems(inventory.items, diagramItemId, 1), nextId: inventory.nextId },
    learnedIds: [...learnedIds, id],
  };
};
