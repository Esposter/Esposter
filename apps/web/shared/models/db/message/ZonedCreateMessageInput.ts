import type { z } from "zod";

import { timeZoneSchema } from "#shared/models/entity/TimeZone";
import { standardCreateMessageInputSchema } from "@esposter/db-schema";

// A message as its sender creates it, with the sender's own time zone, which the time-of-day achievements read the
// Send's hour in
export const zonedCreateMessageInputSchema = standardCreateMessageInputSchema.safeExtend(timeZoneSchema.shape);
export type ZonedCreateMessageInput = z.infer<typeof zonedCreateMessageInputSchema>;
