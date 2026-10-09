import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";

// The bag and queue after `count` units of a processing are queued at `now`, their ingredients taken from the bag at once.
// The units of one processing run one after another, so a queue that is idle starts at `now` and one still running is
// Extended from when it began. Undefined, with nothing spent, where the processing is not known from the start, the bag
// Holds too few ingredients, or the queue would hold more than its size
export const startProcessing = (
  recipe: ProcessingRecipe,
  count: number,
  { inventory, job, now }: { inventory: Inventory; job?: ProcessingJob; now: Temporal.Instant },
): undefined | { inventory: Inventory; job: ProcessingJob } => {
  const queuedCount = job?.count ?? 0;
  if (
    !recipe.isDefaultUnlocked ||
    !Number.isInteger(count) ||
    count < 1 ||
    queuedCount + count > recipe.queueSize ||
    recipe.ingredients.some(({ count: perUnit, id }) => countInventoryItem(inventory.items, id) < perUnit * count)
  )
    return undefined;
  const idleStartedAt = now.subtract({ seconds: queuedCount * recipe.costTime });
  const startedAt = job && Temporal.Instant.compare(job.startedAt, idleStartedAt) > 0 ? job.startedAt : idleStartedAt;
  return {
    inventory: { items: takeItemCounts(inventory.items, recipe.ingredients, count), nextId: inventory.nextId },
    job: { count: queuedCount + count, startedAt },
  };
};
