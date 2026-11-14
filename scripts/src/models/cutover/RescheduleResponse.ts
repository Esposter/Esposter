import { z } from "zod";

// What the functions Worker answers the reschedule route with: how many Scheduler objects it set, for each kind of job
export const rescheduleResponseSchema = z.object({
  scheduledMessageJobs: z.int().nonnegative(),
  scheduledTodoReminders: z.int().nonnegative(),
});
export type RescheduleResponse = z.infer<typeof rescheduleResponseSchema>;
