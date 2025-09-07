import { selectRoomSchema } from "#shared/db/schema/rooms";
import { selectUserSchema } from "#shared/db/schema/users";
import { z } from "zod";

export const createTypingInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  userId: selectUserSchema.shape.id,
  username: selectUserSchema.shape.name,
});
export type CreateTypingInput = z.infer<typeof createTypingInputSchema>;
