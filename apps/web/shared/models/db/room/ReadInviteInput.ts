import type { z } from "zod";

import { selectInviteInMessageSchema } from "@esposter/db-schema";

export const readInviteInputSchema = selectInviteInMessageSchema.shape.id;
export type ReadInviteInput = z.infer<typeof readInviteInputSchema>;
