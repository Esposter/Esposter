import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { roomIdsSchema, sanitizedMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const forwardMessageInputSchema = z.object({
  ...messageIdentityInputSchema.shape,
  message: sanitizedMessageSchema,
  roomIds: roomIdsSchema.shape.roomIds.min(1),
});
export type ForwardMessageInput = z.infer<typeof forwardMessageInputSchema>;
