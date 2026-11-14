import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { useScheduler } from "#server/composables/scheduler/useScheduler";
import { QueueJob } from "@esposter/db-schema";

// Called once the row is written: the job's Scheduler object alarms at `runAt` and sends the job to its queue then
export const scheduleScheduledMessageJob = ({ id, runAt }: ScheduledMessageJobInMessage) =>
  useScheduler(id).schedule(runAt.getTime(), {
    payload: { id },
    queueJob: QueueJob.ProcessScheduledMessageJob,
  });
