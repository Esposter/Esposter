import { selectRoomSchema } from "#shared/db/schema/rooms";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { type } from "arktype";

export const createMessageInputSchema = messageEntitySchema
  .pick("message")
  .merge(type({ roomId: selectRoomSchema.get("id") }));
export type CreateMessageInput = typeof createMessageInputSchema.infer;
