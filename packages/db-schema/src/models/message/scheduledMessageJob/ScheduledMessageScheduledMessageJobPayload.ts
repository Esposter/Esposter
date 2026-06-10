import { MESSAGE_MAX_LENGTH } from "@/models/message/BaseMessageEntity";
import { z } from "zod";

export const scheduledMessageScheduledMessageJobPayloadSchema = z.object({
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});
export type ScheduledMessageScheduledMessageJobPayload = z.infer<
  typeof scheduledMessageScheduledMessageJobPayloadSchema
>;
