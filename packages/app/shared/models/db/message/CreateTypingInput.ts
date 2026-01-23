import { selectRoomInMessageSchema, selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

export const createTypingInputSchema = z.object({
  roomId: selectRoomInMessageSchema.shape.id,
  userId: selectUserSchema.shape.id,
  username: selectUserSchema.shape.name,
});
export type CreateTypingInput = z.infer<typeof createTypingInputSchema>;
