import type { z } from "zod";

import { roomIdSchema } from "@esposter/db-schema";

export const readScheduledMessageJobsInputSchema = roomIdSchema;
export type ReadScheduledMessageJobsInput = z.infer<typeof readScheduledMessageJobsInputSchema>;
