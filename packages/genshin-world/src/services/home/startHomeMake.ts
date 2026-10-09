import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { Inventory } from "#src/models/inventory/Inventory";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";

// The bag and progress after one furnishing is started in a free queue at `now`: its materials taken from the bag at once.
// The queues are one per Trust Rank, each holding one furnishing. Undefined, with nothing spent, where the blueprint is not
// Open, every queue is busy, or the bag holds too few of its materials
export const startHomeMake = (
  blueprint: HomeBlueprint,
  {
    inventory,
    now,
    progress,
    trustRank,
  }: { inventory: Inventory; now: Temporal.Instant; progress: HomeProgress; trustRank: number },
): undefined | { inventory: Inventory; progress: HomeProgress } => {
  const isOpen = blueprint.unlockItemIds.length === 0 || progress.learnedBlueprintIds.includes(blueprint.id);
  if (
    !isOpen ||
    progress.orders.length >= trustRank ||
    blueprint.materials.some(({ count, id }) => countInventoryItem(inventory.items, id) < count)
  )
    return undefined;
  return {
    inventory: { items: takeItemCounts(inventory.items, blueprint.materials, 1), nextId: inventory.nextId },
    progress: { ...progress, orders: [...progress.orders, { blueprintId: blueprint.id, startedAt: now }] },
  };
};
