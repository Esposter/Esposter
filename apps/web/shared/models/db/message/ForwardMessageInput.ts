import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";
import { roomIdsSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const forwardMessageInputSchema = z.object({
  ...messageCompositeKeySchema.shape,
  message: standardMessageEntitySchema.shape.message,
  roomIds: roomIdsSchema.shape.roomIds.min(1),
});
export type ForwardMessageInput = z.infer<typeof forwardMessageInputSchema>;
