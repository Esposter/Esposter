import { createScheduledMessageInputSchema } from "#shared/models/db/message/scheduledMessage/CreateScheduledMessageInput";
import { scheduledMessageIdentityInputSchema } from "#shared/models/db/message/scheduledMessage/ScheduledMessageIdentityInput";
import { z } from "zod";

export const updateScheduledMessageInputSchema = z.object({
  ...createScheduledMessageInputSchema.shape,
  id: scheduledMessageIdentityInputSchema.shape.id,
});
export type UpdateScheduledMessageInput = z.infer<typeof updateScheduledMessageInputSchema>;
