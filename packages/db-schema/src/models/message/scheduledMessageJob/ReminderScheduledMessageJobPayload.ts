import type { ItemEntityType } from "@esposter/shared";

import { sanitizedMessageSchema } from "#src/models/message/SanitizedMessage";
import { ScheduledMessageJobType } from "#src/models/message/ScheduledMessageJobType";
import { MESSAGE_MAX_LENGTH } from "#src/services/message/constants";
import { z } from "zod";

export interface ReminderScheduledMessageJobPayload extends ItemEntityType<ScheduledMessageJobType.Reminder> {
  text: string;
}

export const reminderScheduledMessageJobPayloadSchema = z.object({
  text: sanitizedMessageSchema.pipe(z.string().min(1).max(MESSAGE_MAX_LENGTH)),
  type: z.literal(ScheduledMessageJobType.Reminder),
}) satisfies z.ZodType<ReminderScheduledMessageJobPayload>;
