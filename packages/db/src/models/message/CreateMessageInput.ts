import { messageEntitySchema } from "@/models/message/MessageEntity";
import { selectRoomSchema } from "@/schema/rooms";
import { refineMessageSchema } from "@/services/message/refineMessageSchema";
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
