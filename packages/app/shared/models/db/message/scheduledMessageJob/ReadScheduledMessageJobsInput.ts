import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readScheduledMessageJobsInputSchema = roomIdSchema;
export type ReadScheduledMessageJobsInput = z.infer<typeof readScheduledMessageJobsInputSchema>;
