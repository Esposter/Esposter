import { MESSAGE_MAX_LENGTH } from "@/models/message/BaseMessageEntity";
import { z } from "zod";

export const reminderScheduledMessageJobPayloadSchema = z.object({
  text: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});
export type ReminderScheduledMessageJobPayload = z.infer<typeof reminderScheduledMessageJobPayloadSchema>;
