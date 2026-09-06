import type { z } from "zod";

import { selectCallSessionInMessageSchema } from "@esposter/db-schema";

export const callSessionIdInputSchema = selectCallSessionInMessageSchema.shape.id;
export type CallSessionIdInput = z.infer<typeof callSessionIdInputSchema>;
