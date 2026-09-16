import type { z } from "zod";

import { selectUserSchema } from "@esposter/db-schema";

export const friendUserIdInputSchema = selectUserSchema.shape.id;
export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;
