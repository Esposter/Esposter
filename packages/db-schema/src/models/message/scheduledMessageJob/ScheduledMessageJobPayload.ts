import type { ReminderScheduledMessageJobPayload } from "@/models/message/scheduledMessageJob/ReminderScheduledMessageJobPayload";
import type { ScheduledMessageScheduledMessageJobPayload } from "@/models/message/scheduledMessageJob/ScheduledMessageScheduledMessageJobPayload";

import { reminderScheduledMessageJobPayloadSchema } from "@/models/message/scheduledMessageJob/ReminderScheduledMessageJobPayload";
import { scheduledMessageScheduledMessageJobPayloadSchema } from "@/models/message/scheduledMessageJob/ScheduledMessageScheduledMessageJobPayload";
import { z } from "zod";

export type ScheduledMessageJobPayload =
  | ReminderScheduledMessageJobPayload
  | ScheduledMessageScheduledMessageJobPayload;

export const scheduledMessageJobPayloadSchema = z.discriminatedUnion("type", [
  reminderScheduledMessageJobPayloadSchema,
  scheduledMessageScheduledMessageJobPayloadSchema,
]) satisfies z.ZodType<ScheduledMessageJobPayload>;
