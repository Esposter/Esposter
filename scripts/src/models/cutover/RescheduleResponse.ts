import { z } from "zod";

// What the functions Worker answers the reschedule route with: how many message reminders and TodoList reminders it armed
// On their owners' objects
export const rescheduleResponseSchema = z.object({
  scheduledReminders: z.int().nonnegative(),
  scheduledTodoReminders: z.int().nonnegative(),
});
export type RescheduleResponse = z.infer<typeof rescheduleResponseSchema>;
