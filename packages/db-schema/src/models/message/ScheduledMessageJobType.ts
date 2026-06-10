import { z } from "zod";

export enum ScheduledMessageJobType {
  Reminder = "Reminder",
  ScheduledMessage = "ScheduledMessage",
}

export const scheduledMessageJobTypeSchema = z.enum(
  ScheduledMessageJobType,
) satisfies z.ZodType<ScheduledMessageJobType>;
