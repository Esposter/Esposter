import type { EventGridEvent } from "@azure/eventgrid";

import { z } from "zod";
// Event Grid writes each exhausted delivery to the dead-letter container as a JSON array of the original
// Events in the Event Grid schema, so the shape is that schema's — picked from the SDK's own EventGridEvent
// Rather than restated. Only these five fields are needed to re-publish; the delivery metadata
// (deadLetterReason, deliveryAttempts, ...) is intentionally dropped so the replayed event is a clean resend.
// `id` is carried because a republished event keeps whatever id it is sent with, which makes it the only
// Place a replay counter survives a dead-letter cycle — every cycle writes a brand-new blob, so nothing
// Attached to the blob can count. See parseReplayId.
export type DeadLetteredEvent = Pick<EventGridEvent<unknown>, "data" | "dataVersion" | "eventType" | "id" | "subject">;

export const deadLetteredEventSchema: z.ZodObject<{
  data: z.ZodUnknown;
  dataVersion: z.ZodString;
  eventType: z.ZodString;
  id: z.ZodString;
  subject: z.ZodString;
}> = z.object({
  data: z.unknown(),
  dataVersion: z.string(),
  eventType: z.string(),
  id: z.string(),
  subject: z.string(),
}) satisfies z.ZodType<DeadLetteredEvent>;
