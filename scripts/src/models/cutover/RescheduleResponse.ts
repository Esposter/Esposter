import { z } from "zod";

// What the functions Worker answers the reschedule route with: how many TodoList reminders it armed on their owners' objects
export const rescheduleResponseSchema = z.object({ scheduledTodoReminders: z.int().nonnegative() });
export type RescheduleResponse = z.infer<typeof rescheduleResponseSchema>;
