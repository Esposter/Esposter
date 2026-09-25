import type { z } from "zod";

import { sessionIdSchema } from "@esposter/db-schema";

export const deleteSessionInputSchema = sessionIdSchema.shape.sessionId;
export type DeleteSessionInput = z.infer<typeof deleteSessionInputSchema>;
