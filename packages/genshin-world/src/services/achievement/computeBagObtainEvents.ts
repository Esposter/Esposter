import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// The obtain doings a bag write makes: one for each item the bag holds more of after the write, by how many more, and none
// For an item it takes away. The bag changes only through that write, so an item counts from any source, a quest's reward
// Or a craft's product alike, and each stack or weapon entry counts toward its item's id
const countItems = (items: readonly InventoryItem[]): Map<number, number> => {
  const counts = new Map<number, number>();
  for (const { definition, quantity } of items) counts.set(definition.id, (counts.get(definition.id) ?? 0) + quantity);
  return counts;
};

export const computeBagObtainEvents = (
  previousItems: readonly InventoryItem[],
  nextItems: readonly InventoryItem[],
): AchievementEvent[] => {
  const previousCounts = countItems(previousItems);
  return [...countItems(nextItems)].flatMap(([itemId, count]) => {
    const quantity = count - (previousCounts.get(itemId) ?? 0);
    return quantity > 0 ? [{ kind: AchievementEventKind.ItemObtained, quantity, targetId: String(itemId) }] : [];
  });
};
