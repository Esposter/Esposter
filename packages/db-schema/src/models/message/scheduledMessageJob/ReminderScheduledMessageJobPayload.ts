import type { ItemEntityType } from "@esposter/shared";

import { sanitizedMessageSchema } from "@/models/message/BaseMessageEntity";
import { ScheduledMessageJobType } from "@/models/message/ScheduledMessageJobType";
import { z } from "zod";

export interface ReminderScheduledMessageJobPayload extends ItemEntityType<ScheduledMessageJobType.Reminder> {
  text: string;
}

export const reminderScheduledMessageJobPayloadSchema = z.object({
  text: sanitizedMessageSchema.pipe(z.string().min(1)),
  type: z.literal(ScheduledMessageJobType.Reminder),
}) satisfies z.ZodType<ReminderScheduledMessageJobPayload>;
