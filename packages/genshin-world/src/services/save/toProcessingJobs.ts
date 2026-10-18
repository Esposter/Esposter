import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingJobSave } from "#src/models/cooking/ProcessingJobSave";

// The save's processing queues with each start read back into its Temporal instant
export const toProcessingJobs = (processingJobs: Record<string, ProcessingJobSave>): Record<number, ProcessingJob> =>
  Object.fromEntries(
    Object.entries(processingJobs).map(([recipeId, { count, startedAt }]) => [
      recipeId,
      { count, startedAt: Temporal.Instant.from(startedAt) },
    ]),
  );
