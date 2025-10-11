import { baseMessageEntitySchema } from "@/models/message/BaseMessageEntity";
import { selectRoomSchema } from "@/schema/rooms";
import { refineMessageSchema } from "@/services/message/refineMessageSchema";
import { z } from "zod";

export const baseCreateMessageInputSchema = refineMessageSchema(
  z.object({
    ...baseMessageEntitySchema
      .pick({ files: true, message: true, replyRowKey: true, type: true })
      .partial({ files: true, message: true }).shape,
    roomId: selectRoomSchema.shape.id,
  }),
);
export type BaseCreateMessageInput = z.infer<typeof baseCreateMessageInputSchema>;
