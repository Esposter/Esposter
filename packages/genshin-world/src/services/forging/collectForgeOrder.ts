import type { ForgeOrder } from "#src/models/forging/ForgeOrder";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";

// The bag and order after every unit of a queue's order done by `now` is taken into the bag. The units done are counted from
// The moment the order began, and a unit's results are taken all together, so the units done before the first the bag has
// No room for are taken in, and that unit waits in the queue with the units behind it. An order fully collected is no order, and its queue is free again
export const collectForgeOrder = (
  recipe: ForgeRecipe,
  order: ForgeOrder,
  {
    inventory,
    now,
    resultDefinition,
  }: { inventory: Inventory; now: Temporal.Instant; resultDefinition: ItemDefinition },
): { inventory: Inventory; order?: ForgeOrder } => {
  const elapsedSeconds = now.since(order.startedAt).total({ unit: "second" });
  const doneCount = Math.min(order.count, Math.max(Math.floor(elapsedSeconds / recipe.seconds), 0));
  if (doneCount === 0) return { inventory, order };
  const { overflow } = addInventoryItem(inventory, resultDefinition, doneCount * recipe.resultCount);
  const collectedCount = doneCount - Math.ceil(overflow / recipe.resultCount);
  if (collectedCount === 0) return { inventory, order };
  const addition = addInventoryItem(inventory, resultDefinition, collectedCount * recipe.resultCount);
  const remainingCount = order.count - collectedCount;
  if (remainingCount === 0) return { inventory: addition.inventory };
  return {
    inventory: addition.inventory,
    order: {
      count: remainingCount,
      recipeId: order.recipeId,
      startedAt: order.startedAt.add({ seconds: collectedCount * recipe.seconds }),
    },
  };
};
