import { selectScheduledMessageJobInMessageSchema } from "#src/schema/scheduledMessageJobsInMessage";
import { z } from "zod";

export const scheduledMessageJobQueueMessageSchema = z.object({
  id: selectScheduledMessageJobInMessageSchema.shape.id,
});
export type ScheduledMessageJobQueueMessage = z.infer<typeof scheduledMessageJobQueueMessageSchema>;
