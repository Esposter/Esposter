import type { ReminderScheduledMessageJobPayload } from "#src/models/message/scheduledMessageJob/ReminderScheduledMessageJobPayload";
import type { ScheduledMessageScheduledMessageJobPayload } from "#src/models/message/scheduledMessageJob/ScheduledMessageScheduledMessageJobPayload";

import { reminderScheduledMessageJobPayloadSchema } from "#src/models/message/scheduledMessageJob/ReminderScheduledMessageJobPayload";
import { scheduledMessageScheduledMessageJobPayloadSchema } from "#src/models/message/scheduledMessageJob/ScheduledMessageScheduledMessageJobPayload";
import { z } from "zod";

export type ScheduledMessageJobPayload =
  | ReminderScheduledMessageJobPayload
  | ScheduledMessageScheduledMessageJobPayload;

export const scheduledMessageJobPayloadSchema = z.discriminatedUnion("type", [
  reminderScheduledMessageJobPayloadSchema,
  scheduledMessageScheduledMessageJobPayloadSchema,
]) satisfies z.ZodType<ScheduledMessageJobPayload>;
