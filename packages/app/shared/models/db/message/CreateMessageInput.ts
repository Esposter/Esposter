import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { refineMessageSchema } from "#shared/services/message/refineMessageSchema";
import { selectRoomSchema } from "@esposter/db";
import { z } from "zod";

export const createMessageInputSchema = refineMessageSchema(
  z.object({
    ...messageEntitySchema
      .pick({ files: true, message: true, replyRowKey: true, type: true })
      .partial({ files: true, message: true, type: true }).shape,
    roomId: selectRoomSchema.shape.id,
  }),
);
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
