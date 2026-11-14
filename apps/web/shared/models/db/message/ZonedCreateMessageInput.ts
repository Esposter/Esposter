import type { z } from "zod";

import { createMessageInputSchema } from "#shared/models/db/message/CreateMessageInput";
import { timeZoneSchema } from "#shared/models/entity/TimeZone";

// A message as its sender creates it, with the sender's own time zone, which the time-of-day achievements read the
// Send's hour in
export const zonedCreateMessageInputSchema = createMessageInputSchema.safeExtend(timeZoneSchema.shape);
export type ZonedCreateMessageInput = z.infer<typeof zonedCreateMessageInputSchema>;
