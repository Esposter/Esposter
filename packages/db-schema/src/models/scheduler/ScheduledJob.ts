import type { QueueJob } from "#src/models/queue/QueueJob";
import type { ScheduledMessageJobQueueMessage } from "#src/models/azure/queue/ScheduledMessageJobQueueMessage";

// What a Scheduler object holds until its alarm: the queue job it sends to, and the body that job's queue delivers
export type ScheduledJob = {
  payload: ScheduledMessageJobQueueMessage;
  queueJob: typeof QueueJob.ProcessScheduledMessageJob;
};
