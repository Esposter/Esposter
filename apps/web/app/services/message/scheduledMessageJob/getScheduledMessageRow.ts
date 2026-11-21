import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { ScheduledMessageJobType } from "@esposter/db-schema";

// The fields the scheduled message's row holds for a job, without the version or deletion a write sets over it
export const getScheduledMessageRow = (
  job: ScheduledMessageJobWithRoom,
  {
    message,
    replyToId,
  }: Extract<ScheduledMessageJobWithRoom["payload"], { type: typeof ScheduledMessageJobType.ScheduledMessage }>,
  sessionUserId: string,
) => ({ id: job.id, message, replyToId, runAt: job.runAt, userId: sessionUserId });
