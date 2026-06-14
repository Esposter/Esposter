import type { ItemEntityType } from "@esposter/shared";

import { MESSAGE_MAX_LENGTH } from "@/models/message/BaseMessageEntity";
import { ScheduledMessageJobType } from "@/models/message/ScheduledMessageJobType";
import { sanitizeMessageHtml } from "@esposter/shared";
import { z } from "zod";

export interface ScheduledMessageScheduledMessageJobPayload extends ItemEntityType<ScheduledMessageJobType.ScheduledMessage> {
  message: string;
}

export const scheduledMessageScheduledMessageJobPayloadSchema = z.object({
  message: z.string().transform(sanitizeMessageHtml).pipe(z.string().min(1).max(MESSAGE_MAX_LENGTH)),
  type: z.literal(ScheduledMessageJobType.ScheduledMessage),
}) satisfies z.ZodType<ScheduledMessageScheduledMessageJobPayload>;
