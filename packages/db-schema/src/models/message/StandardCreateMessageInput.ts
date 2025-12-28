import { standardMessageEntitySchema } from "@/models/message/StandardMessageEntity";
import { selectRoomSchema } from "@/schema/rooms";
import { refineMessageSchema } from "@/services/message/refineMessageSchema";
import { z } from "zod";

export const standardCreateMessageInputSchema = refineMessageSchema(
  z.object({
    ...standardMessageEntitySchema
      .pick({ files: true, message: true, replyRowKey: true, type: true })
      .partial({ files: true, message: true }).shape,
    roomId: selectRoomSchema.shape.id,
  }),
);
export type StandardCreateMessageInput = z.infer<typeof standardCreateMessageInputSchema>;
