import { selectRoomSchema } from "#shared/db/schema/rooms";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { refineMessageSchema } from "#shared/services/esbabbler/refineMessageSchema";
import { z } from "zod";

export const createMessageInputSchema = refineMessageSchema(
  z.object({
    ...messageEntitySchema
      .pick({ files: true, message: true, replyRowKey: true })
      .partial({ files: true, message: true }).shape,
    roomId: selectRoomSchema.shape.id,
  }),
);
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
