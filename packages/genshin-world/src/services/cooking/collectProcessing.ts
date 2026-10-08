import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";

// The bag and queue after every unit of a processing done by `now` is taken into the bag. The units done are counted from
// The moment the queue began, and a unit's results are taken all together, so a unit the bag has no room for waits in the
// Queue for the room, with the units behind it. A queue emptied is no job
export const collectProcessing = (
  recipe: ProcessingRecipe,
  job: ProcessingJob | undefined,
  {
    inventory,
    now,
    resultDefinition,
  }: { inventory: Inventory; now: Temporal.Instant; resultDefinition: ItemDefinition },
): { inventory: Inventory; job?: ProcessingJob } => {
  if (!job) return { inventory };
  const elapsedSeconds = now.since(job.startedAt).total({ unit: "second" });
  const doneCount = Math.min(job.count, Math.floor(elapsedSeconds / recipe.costTime));
  if (doneCount === 0) return { inventory, job };
  const addition = addInventoryItem(inventory, resultDefinition, doneCount * recipe.result.count);
  if (addition.overflow > 0) return { inventory, job };
  const remainingCount = job.count - doneCount;
  if (remainingCount === 0) return { inventory: addition.inventory };
  return {
    inventory: addition.inventory,
    job: { count: remainingCount, startedAt: job.startedAt.add({ seconds: doneCount * recipe.costTime }) },
  };
};
