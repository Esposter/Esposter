import type { ScheduleMessageInput } from "#shared/models/db/message/scheduledMessageJob/ScheduleMessageInput";

import type { scheduledMessageJobsInMessage } from "@esposter/db-schema";
import { ScheduledMessageJobType } from "@esposter/db-schema";
// A scheduled message and its reschedule store the same row, so both spell the payload once here
export const getScheduledMessageJobValues = (
  { message, replyRowKey, roomId, runAt }: ScheduleMessageInput,
  userId: string,
): typeof scheduledMessageJobsInMessage.$inferInsert => ({
  payload: { message, replyRowKey, type: ScheduledMessageJobType.ScheduledMessage },
  roomId,
  runAt,
  userId,
});
