import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { ScheduledMessageJobType } from "@esposter/db-schema";

// The fields the reminder's row holds for a job, without the version or deletion a write sets over it
export const getReminderRow = (
  job: ScheduledMessageJobWithRoom,
  { text }: Extract<ScheduledMessageJobWithRoom["payload"], { type: typeof ScheduledMessageJobType.Reminder }>,
) => ({ id: job.id, roomId: job.roomId, runAt: job.runAt, text });
