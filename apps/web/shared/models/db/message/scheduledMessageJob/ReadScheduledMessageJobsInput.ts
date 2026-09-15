import { roomIdSchema } from "@esposter/db-schema";
import type { z } from "zod";

export const readScheduledMessageJobsInputSchema = roomIdSchema;
export type ReadScheduledMessageJobsInput = z.infer<typeof readScheduledMessageJobsInputSchema>;
