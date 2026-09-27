import { MessageType } from "#src/models/message/MessageType";
import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { userMessageTypeSchema } from "#src/models/message/UserMessageType";
import { roomIdSchema } from "#src/models/shared/RoomId";
import { refineMessageSchema } from "#src/services/message/refineMessageSchema";
import { z } from "zod";

export const standardCreateMessageInputSchema = refineMessageSchema(
  z.object({
    ...roomIdSchema.shape,
    ...standardMessageEntitySchema
      .pick({ files: true, message: true, replyRowKey: true })
      .partial({ files: true, message: true }).shape,
    type: userMessageTypeSchema.default(MessageType.Message),
  }),
);
export type StandardCreateMessageInput = z.infer<typeof standardCreateMessageInputSchema>;
