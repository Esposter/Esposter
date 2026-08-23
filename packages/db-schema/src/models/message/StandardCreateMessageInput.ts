import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { roomIdSchema } from "#src/models/shared/RoomId";
import { refineMessageSchema } from "#src/services/message/refineMessageSchema";
import { z } from "zod";

export const standardCreateMessageInputSchema = refineMessageSchema(
  z.object({
    ...roomIdSchema.shape,
    ...standardMessageEntitySchema
      .pick({ files: true, message: true, replyRowKey: true, type: true })
      .partial({ files: true, message: true }).shape,
  }),
);
export type StandardCreateMessageInput = z.infer<typeof standardCreateMessageInputSchema>;
