import { selectRoomSchema, selectUserSchema } from "@esposter/db";
import { z } from "zod";

export const createTypingInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userId: selectUserSchema.shape.id,
  username: selectUserSchema.shape.name,
});
export type CreateTypingInput = z.infer<typeof createTypingInputSchema>;
