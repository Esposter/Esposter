import type { QueueJob } from "@esposter/db-schema";

import { MockJobQueue } from "#src/workers/models/MockJobQueue";
import { getOrCreate } from "@esposter/shared";

// The binding a Worker reaches for a job is one queue per job, so the double is one per job.
// Each call for that job answers with the same instance.
const mockJobQueues = new Map<QueueJob, MockJobQueue>();

export const getJobQueue = (job: QueueJob): MockJobQueue =>
  getOrCreate(mockJobQueues, job, () => new MockJobQueue(job));
