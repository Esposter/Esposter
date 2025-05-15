import { selectRoomSchema } from "#shared/db/schema/rooms";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { z } from "zod";
// @TODO: oneOf([files, message])
export const createMessageInputSchema = messageEntitySchema
  .pick({ files: true, message: true, replyRowKey: true })
  // @TODO: We shouldn't need to explicitly mark these fields as partial
  // since they already have defaults... zod 4 please
  .partial({ files: true, message: true })
  .extend(z.object({ roomId: selectRoomSchema.shape.id }));
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
