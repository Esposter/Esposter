import { standardMessageEntitySchema } from "@/models/message/StandardMessageEntity";
import { selectRoomInMessageSchema } from "@/schema/roomsInMessage";
import { z } from "zod";

export const standardCreateMessageInputSchema = z.object({
  ...standardMessageEntitySchema
    .pick({ files: true, message: true, replyRowKey: true, type: true })
    .partial({ files: true, message: true }).shape,
  roomId: selectRoomInMessageSchema.shape.id,
});
export type StandardCreateMessageInput = z.infer<typeof standardCreateMessageInputSchema>;
