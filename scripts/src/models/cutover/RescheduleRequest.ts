import type { ScheduledReminder } from "@esposter/db-schema";

// The reschedule route's body: the old estate's pending message reminders, each with the owner whose object arms it
export interface RescheduleRequest {
  reminders: (ScheduledReminder & { userId: string })[];
}
