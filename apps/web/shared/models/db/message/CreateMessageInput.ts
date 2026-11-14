import {
  FILE_MAX_LENGTH,
  fileEntitySchema,
  MessageType,
  refineMessageSchema,
  roomIdSchema,
  roomMessageSchema,
  sanitizedMessageSchema,
  userMessageTypeSchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A message as its sender composes it: text, attachments the uploads reserved, the message it replies to, and the type
// A member may post. At least one of text or attachments is required
export const createMessageInputSchema = refineMessageSchema(
  z.object({
    files: createUniqueArraySchema(fileEntitySchema, "id").max(FILE_MAX_LENGTH).optional(),
    message: sanitizedMessageSchema.optional(),
    replyToId: roomMessageSchema.shape.replyToId.optional(),
    ...roomIdSchema.shape,
    type: userMessageTypeSchema.default(MessageType.Message),
  }),
);
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
