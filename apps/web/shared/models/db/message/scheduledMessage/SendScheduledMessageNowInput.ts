import { scheduledMessageIdentityInputSchema } from "#shared/models/db/message/scheduledMessage/ScheduledMessageIdentityInput";
import { z } from "zod";

export const sendScheduledMessageNowInputSchema = z.object({ ...scheduledMessageIdentityInputSchema.shape });
export type SendScheduledMessageNowInput = z.infer<typeof sendScheduledMessageNowInputSchema>;
