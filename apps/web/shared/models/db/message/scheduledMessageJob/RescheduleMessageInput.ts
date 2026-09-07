import { cancelScheduledMessageJobInputSchema } from "#shared/models/db/message/scheduledMessageJob/CancelScheduledMessageJobInput";
import { scheduleMessageInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleMessageInput";
import { z } from "zod";

export const rescheduleMessageInputSchema = z.object({
  ...cancelScheduledMessageJobInputSchema.shape,
  ...scheduleMessageInputSchema.shape,
});
export type RescheduleMessageInput = z.infer<typeof rescheduleMessageInputSchema>;
