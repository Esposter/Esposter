import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag's entries after a count of one item is taken out of its stacks, from the first stack it lies in onwards, and
// A stack emptied is dropped. The bag must hold that many, or the take is refused
export const takeInventoryItems = (items: InventoryItem[], itemId: number, count: number): InventoryItem[] => {
  if (countInventoryItem(items, itemId) < count)
    throw new InvalidOperationError(Operation.Update, takeInventoryItems.name, `${count} of ${itemId}`);
  let remainingCount = count;
  return items.flatMap((item) => {
    if (item.definition.id !== itemId || remainingCount === 0) return [item];
    const takenCount = Math.min(item.quantity, remainingCount);
    remainingCount -= takenCount;
    return item.quantity > takenCount ? [{ ...item, quantity: item.quantity - takenCount }] : [];
  });
};
