import { selectUserSchema } from "@esposter/db-schema";
import type { z } from "zod";

export const friendUserIdInputSchema = selectUserSchema.shape.id;
export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;
