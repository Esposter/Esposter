import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingJobSave } from "#src/models/cooking/ProcessingJobSave";

// The processing queues as the save holds them, each start as its ISO string
export const toProcessingJobSaves = (
  processingJobs: Record<number, ProcessingJob>,
): Record<string, ProcessingJobSave> =>
  Object.fromEntries(
    Object.entries(processingJobs).map(([recipeId, { count, startedAt }]) => [
      recipeId,
      { count, startedAt: startedAt.toString() },
    ]),
  );
