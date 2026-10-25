import type { EventGridEventInput } from "#src/models/azure/eventGrid/EventGridEventInput";

import { z } from "zod";

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
