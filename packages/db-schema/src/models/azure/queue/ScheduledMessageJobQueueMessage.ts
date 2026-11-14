import { queueMessageEnvelopeSchema } from "#src/models/queue/QueueMessageEnvelope";
import { selectScheduledMessageJobInMessageSchema } from "#src/schema/message/scheduledMessageJobsInMessage";
import { z } from "zod";

export interface ScheduledMessageJobQueueMessage {
  id: string;
}

export const scheduledMessageJobQueueMessageSchema = z.object({
  ...queueMessageEnvelopeSchema.shape,
  id: selectScheduledMessageJobInMessageSchema.shape.id,
}) satisfies z.ZodType<ScheduledMessageJobQueueMessage>;
