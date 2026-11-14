import { scheduledMessageIdentityInputSchema } from "#shared/models/db/message/scheduledMessage/ScheduledMessageIdentityInput";
import { z } from "zod";

export const deleteScheduledMessageInputSchema = z.object({ ...scheduledMessageIdentityInputSchema.shape });
export type DeleteScheduledMessageInput = z.infer<typeof deleteScheduledMessageInputSchema>;
