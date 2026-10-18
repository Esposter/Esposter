import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { collectProcessing } from "#src/services/cooking/collectProcessing";

// The bag and queues after every processing's done units by `now` are taken into the bag, each queue by its recipe. A
// Queue emptied is dropped from the jobs, so only the queues still holding units are left in them
export const collectProcessingJobs = (
  recipes: ProcessingRecipe[],
  jobs: Record<number, ProcessingJob>,
  {
    getResultDefinition,
    inventory,
    now,
  }: { getResultDefinition: (itemId: number) => ItemDefinition; inventory: Inventory; now: Temporal.Instant },
): { inventory: Inventory; jobs: Record<number, ProcessingJob> } => {
  const nextJobs: Record<number, ProcessingJob> = {};
  let nextInventory = inventory;
  for (const recipe of recipes) {
    const job = jobs[recipe.id];
    if (!job) continue;
    const collected = collectProcessing(recipe, job, {
      inventory: nextInventory,
      now,
      resultDefinition: getResultDefinition(recipe.result.id),
    });
    nextInventory = collected.inventory;
    if (collected.job) nextJobs[recipe.id] = collected.job;
  }
  return { inventory: nextInventory, jobs: nextJobs };
};
