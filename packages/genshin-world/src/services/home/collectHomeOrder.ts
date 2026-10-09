import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { HomeOrder } from "#src/models/home/HomeOrder";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";

// The bag and progress after `order`, a furnishing queued in `progress`, is taken into the bag once its seconds have passed.
// Its first making gives the Trust EXP its blueprint names. A furnishing the bag has no room for waits in its queue, and an
// Order not yet done is left as it is. The order is found by its identity in `progress.orders`, and one not queued there,
// Such as an order already collected, gives nothing
export const collectHomeOrder = (
  order: HomeOrder,
  blueprint: HomeBlueprint,
  {
    inventory,
    now,
    progress,
    resultDefinition,
  }: { inventory: Inventory; now: Temporal.Instant; progress: HomeProgress; resultDefinition: ItemDefinition },
): { inventory: Inventory; progress: HomeProgress } => {
  if (!progress.orders.includes(order)) return { inventory, progress };
  const elapsedSeconds = now.since(order.startedAt).total({ unit: "second" });
  if (elapsedSeconds < blueprint.seconds) return { inventory, progress };
  const addition = addInventoryItem(inventory, resultDefinition, 1);
  if (addition.overflow > 0) return { inventory, progress };
  const isFirstMaking = !progress.madeBlueprintIds.includes(blueprint.id);
  return {
    inventory: addition.inventory,
    progress: {
      ...progress,
      madeBlueprintIds: isFirstMaking ? [...progress.madeBlueprintIds, blueprint.id] : progress.madeBlueprintIds,
      orders: progress.orders.filter((queued) => queued !== order),
      trustExp: isFirstMaking ? progress.trustExp + blueprint.trustExp : progress.trustExp,
    },
  };
};
