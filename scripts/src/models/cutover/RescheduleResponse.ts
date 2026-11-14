import { z } from "zod";

// What the functions Worker answers the reschedule route with: how many Scheduler objects it set
export const rescheduleResponseSchema = z.object({ scheduled: z.int().nonnegative() });
export type RescheduleResponse = z.infer<typeof rescheduleResponseSchema>;
