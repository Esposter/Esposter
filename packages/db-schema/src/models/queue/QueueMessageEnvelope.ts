import { z } from "zod";

// The fields every queue message carries in its own body, whatever its job. `attempt` counts how many times the
// Dead-letter consumer has republished the message to its source queue. No producer sets it, so a first delivery reads 0
// At the queue's boundary, which is what the default states.
export interface QueueMessageEnvelope {
  attempt: number;
}

export const queueMessageEnvelopeSchema = z.object({
  attempt: z.int().nonnegative().default(0),
}) satisfies z.ZodType<QueueMessageEnvelope>;
