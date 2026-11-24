import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCategoryRoomMap } from "#src/models/inventory/ItemCategoryRoomMap";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";

// The bag and queue after every unit of a processing done by `now` is taken into the bag. The units done are counted
// From the moment the queue began, and a unit's results are taken all together, so the units done before the first the
// Bag has no room for are taken in, and that unit waits in the queue for the room, with the units behind it. A queue
// Emptied is no job
export const collectProcessing = (
  recipe: ProcessingRecipe,
  job: ProcessingJob | undefined,
  {
    inventory,
    itemRooms,
    now,
    resultDefinition,
  }: { inventory: Inventory; itemRooms: ItemCategoryRoomMap; now: Temporal.Instant; resultDefinition: ItemDefinition },
): { inventory: Inventory; job?: ProcessingJob } => {
  if (!job) return { inventory };
  const elapsedSeconds = now.since(job.startedAt).total({ unit: "second" });
  const doneCount = Math.min(job.count, Math.max(Math.floor(elapsedSeconds / recipe.costTime), 0));
  if (doneCount === 0) return { inventory, job };
  const { overflow } = addInventoryItem(inventory, resultDefinition, doneCount * recipe.result.count, itemRooms);
  const collectedCount = doneCount - Math.ceil(overflow / recipe.result.count);
  if (collectedCount === 0) return { inventory, job };
  const addition = addInventoryItem(inventory, resultDefinition, collectedCount * recipe.result.count, itemRooms);
  const remainingCount = job.count - collectedCount;
  if (remainingCount === 0) return { inventory: addition.inventory };
  return {
    inventory: addition.inventory,
    job: { count: remainingCount, startedAt: job.startedAt.add({ seconds: collectedCount * recipe.costTime }) },
  };
};
