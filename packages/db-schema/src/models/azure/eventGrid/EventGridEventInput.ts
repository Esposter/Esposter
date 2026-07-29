import type { EventGridEvent } from "@azure/eventgrid";

import { z } from "zod";

// The fields of an Event Grid event this system authors or reads back — picked from the SDK's own EventGridEvent
// Rather than restated, so the envelope has exactly one definition and follows the SDK when it moves. The dropped
// Fields are the ones the service owns: `topic` is stamped by the topic itself, `eventTime` by the publish, and the
// Delivery metadata a dead-letter payload carries (deadLetterReason, deliveryAttempts) is deliberately not replayed.
export type EventGridEventInput<TData> = Pick<
  EventGridEvent<TData>,
  "data" | "dataVersion" | "eventType" | "id" | "subject"
>;
// One envelope schema for every event type: only `data` varies, so it is the parameter and the four envelope fields
// Are declared once here instead of per event model.
export const createEventGridEventSchema = <TData>(dataSchema: z.ZodType<TData>) =>
  z.object({
    data: dataSchema,
    dataVersion: z.string(),
    eventType: z.string(),
    id: z.string(),
    subject: z.string(),
  }) satisfies z.ZodType<EventGridEventInput<TData>>;
