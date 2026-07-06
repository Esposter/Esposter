import type { ItemEntityType } from "@esposter/shared";

import { sanitizedMessageSchema } from "@/models/message/BaseMessageEntity";
import { ScheduledMessageJobType } from "@/models/message/ScheduledMessageJobType";
import { z } from "zod";

export interface ScheduledMessageScheduledMessageJobPayload extends ItemEntityType<ScheduledMessageJobType.ScheduledMessage> {
  message: string;
}

export const scheduledMessageScheduledMessageJobPayloadSchema = z.object({
  message: sanitizedMessageSchema.pipe(z.string().min(1)),
  type: z.literal(ScheduledMessageJobType.ScheduledMessage),
}) satisfies z.ZodType<ScheduledMessageScheduledMessageJobPayload>;
