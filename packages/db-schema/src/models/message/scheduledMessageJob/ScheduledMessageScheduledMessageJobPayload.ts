import type { ItemEntityType } from "@esposter/shared";

import { reverseTickedTimestampSchema } from "#src/models/azure/table/ReverseTickedTimestamp";
import { sanitizedMessageSchema } from "#src/models/message/SanitizedMessage";
import { ScheduledMessageJobType } from "#src/models/message/ScheduledMessageJobType";
import { MESSAGE_MAX_LENGTH } from "#src/services/message/constants";
import { z } from "zod";

export interface ScheduledMessageScheduledMessageJobPayload extends ItemEntityType<ScheduledMessageJobType.ScheduledMessage> {
  message: string;
  // The thread the message is scheduled into, empty for the room itself. Stored on the payload rather than as a
  // Column: the job row is addressed by room and time, and where in the room a message lands is the message's
  // Own business — the same field the send path takes
  replyRowKey: string;
}

export const scheduledMessageScheduledMessageJobPayloadSchema = z.object({
  message: sanitizedMessageSchema.pipe(z.string().min(1).max(MESSAGE_MAX_LENGTH)),
  replyRowKey: reverseTickedTimestampSchema.or(z.literal("")).default(""),
  type: z.literal(ScheduledMessageJobType.ScheduledMessage),
}) satisfies z.ZodType<ScheduledMessageScheduledMessageJobPayload>;
