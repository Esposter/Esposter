import { selectScheduledMessageJobInMessageSchema } from "#src/schema/scheduledMessageJobsInMessage";
import { z } from "zod";

export interface ScheduledMessageJobQueueMessage {
  id: string;
}

export const scheduledMessageJobQueueMessageSchema = z.object({
  id: selectScheduledMessageJobInMessageSchema.shape.id,
}) satisfies z.ZodType<ScheduledMessageJobQueueMessage>;
