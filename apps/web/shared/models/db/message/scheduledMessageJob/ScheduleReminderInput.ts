import { roomIdSchema, sanitizedMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

// A reminder is the person's own, set in the room it is about: its text is sanitized and never empty, and its time is
// the moment the alarm sends it
export const scheduleReminderInputSchema = z.object({
  ...roomIdSchema.shape,
  runAt: z.coerce.date(),
  text: sanitizedMessageSchema.pipe(z.string().min(1)),
});
export type ScheduleReminderInput = z.infer<typeof scheduleReminderInputSchema>;
