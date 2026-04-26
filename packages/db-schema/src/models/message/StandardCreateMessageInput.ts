import { standardMessageEntitySchema } from "@/models/message/StandardMessageEntity";
import { roomIdSchema } from "@/models/shared/RoomId";
import { refineMessageSchema } from "@/services/message/refineMessageSchema";
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
