import { selectRoomSchema } from "#shared/db/schema/rooms";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { z } from "zod";

export const createMessageInputSchema = z
  .object({ roomId: selectRoomSchema.shape.id })
  .merge(messageEntitySchema.pick({ replyRowKey: true }))
  // @TODO: oneOf([files, message])
  .merge(messageEntitySchema.pick({ files: true, message: true }).partial());
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
