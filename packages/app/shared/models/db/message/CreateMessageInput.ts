import { selectRoomSchema } from "#shared/db/schema/rooms";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { refineMessageSchema } from "#shared/services/esbabbler/refineMessageSchema";
import { z } from "zod/v4";

export const createMessageInputSchema = refineMessageSchema(
  z.object({
    ...messageEntitySchema.pick({ replyRowKey: true }).shape,
    ...messageEntitySchema.pick({ files: true, message: true }).partial().shape,
    roomId: selectRoomSchema.shape.id,
  }),
);
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
