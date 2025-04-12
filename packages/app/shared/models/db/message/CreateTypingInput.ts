import { selectRoomSchema } from "#shared/db/schema/rooms";
import { selectUserSchema } from "#shared/db/schema/users";
import { type } from "arktype";

export const createTypingInputSchema = type({
  roomId: selectRoomSchema.get("id"),
  userId: selectUserSchema.get("id"),
  username: selectUserSchema.get("name"),
});
export type CreateTypingInput = typeof createTypingInputSchema.infer;
