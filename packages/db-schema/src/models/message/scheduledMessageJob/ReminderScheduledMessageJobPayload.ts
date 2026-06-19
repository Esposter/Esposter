import type { ItemEntityType } from "@esposter/shared";

import { MESSAGE_MAX_LENGTH } from "@/models/message/BaseMessageEntity";
import { ScheduledMessageJobType } from "@/models/message/ScheduledMessageJobType";
import { sanitizeMessageHtml } from "@esposter/shared";
import { z } from "zod";

export interface ReminderScheduledMessageJobPayload extends ItemEntityType<ScheduledMessageJobType.Reminder> {
  text: string;
}

export const reminderScheduledMessageJobPayloadSchema = z.object({
  text: z.string().transform(sanitizeMessageHtml).pipe(z.string().min(1).max(MESSAGE_MAX_LENGTH)),
  type: z.literal(ScheduledMessageJobType.Reminder),
}) satisfies z.ZodType<ReminderScheduledMessageJobPayload>;
