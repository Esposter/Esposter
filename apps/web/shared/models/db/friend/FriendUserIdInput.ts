import type { z } from "zod";

import { selectUserInAuthSchema } from "@esposter/db-schema";

export const friendUserIdInputSchema = selectUserInAuthSchema.shape.id;
export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;
