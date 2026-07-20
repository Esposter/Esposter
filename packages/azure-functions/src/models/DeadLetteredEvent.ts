import { z } from "zod";

// Event Grid writes each exhausted delivery to the dead-letter container as a JSON array of the original
// Events in the Event Grid schema. Only these four fields are needed to re-publish; the delivery metadata
// (deadLetterReason, deliveryAttempts, ...) is intentionally dropped so the replayed event is a clean resend.
export interface DeadLetteredEvent {
  data?: unknown;
  dataVersion: string;
  eventType: string;
  subject: string;
}

export const deadLetteredEventSchema: z.ZodObject<{
  data: z.ZodUnknown;
  dataVersion: z.ZodString;
  eventType: z.ZodString;
  subject: z.ZodString;
}> = z.object({
  data: z.unknown(),
  dataVersion: z.string(),
  eventType: z.string(),
  subject: z.string(),
}) satisfies z.ZodType<DeadLetteredEvent>;
