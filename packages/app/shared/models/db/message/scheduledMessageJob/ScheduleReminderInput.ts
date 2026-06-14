import {
  reminderScheduledMessageJobPayloadSchema,
  roomIdSchema,
  selectScheduledMessageJobInMessageSchema,
} from "@esposter/db-schema";
import { z } from "zod";

export const scheduleReminderInputSchema = z.object({
  ...roomIdSchema.shape,
  runAt: selectScheduledMessageJobInMessageSchema.shape.runAt,
  text: reminderScheduledMessageJobPayloadSchema.shape.text,
});
export type ScheduleReminderInput = z.infer<typeof scheduleReminderInputSchema>;
