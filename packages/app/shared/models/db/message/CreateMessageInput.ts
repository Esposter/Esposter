import { selectRoomSchema } from "#shared/db/schema/rooms";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { z } from "zod/v4";

export const createMessageInputSchema = z.object({
  ...messageEntitySchema.pick({ replyRowKey: true }).shape,
  // @TODO: oneOf([files, message])
  ...messageEntitySchema.pick({ files: true, message: true }).partial().shape,
  roomId: selectRoomSchema.shape.id,
});
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
