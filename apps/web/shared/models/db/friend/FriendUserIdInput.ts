import { selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const friendUserIdInputSchema = selectUserSchema.shape.id;
export type FriendUserIdInput = z.infer<typeof friendUserIdInputSchema>;
