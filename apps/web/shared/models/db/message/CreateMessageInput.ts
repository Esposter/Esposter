import {
  FILE_MAX_LENGTH,
  fileEntitySchema,
  MESSAGE_MAX_LENGTH,
  MessageType,
  pollMessageContentSchema,
  refineMessageSchema,
  roomIdSchema,
  roomMessageSchema,
  userMessageTypeSchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema, getResult, jsonDateParse, sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

// A poll's body is the JSON its own schema reads, bounds included. It is never sanitized: the sanitizer would rewrite that
// JSON (an ampersand becomes an entity and markup is stripped), so the room would hold a poll its sender did not write.
// It is read the way the poll's viewer reads it, by jsonDateParse, so a poll the server accepts is one the viewer renders
const checkIsPollMessage = (message: string | undefined) =>
  message !== undefined &&
  // A body that is not JSON is no poll, which the schema refuses as undefined
  pollMessageContentSchema.safeParse(getResult((): unknown => jsonDateParse(message)).unwrapOr(undefined)).success;

// A message as its sender composes it: text, attachments the uploads reserved, the message it replies to, and the type
// A member may post. At least one of text or attachments is required. Text is sanitized on the way in, and either kind of
// Body is bounded by MESSAGE_MAX_LENGTH as it arrives and again as it is stored, since sanitizing can lengthen text
export const createMessageInputSchema = refineMessageSchema(
  z
    .object({
      files: createUniqueArraySchema(fileEntitySchema, "id").max(FILE_MAX_LENGTH).optional(),
      message: z.string().max(MESSAGE_MAX_LENGTH).optional(),
      replyToId: roomMessageSchema.shape.replyToId.optional(),
      ...roomIdSchema.shape,
      type: userMessageTypeSchema.default(MessageType.Message),
    })
    .overwrite(({ message, type, ...input }) => ({
      ...input,
      message: message === undefined || type === MessageType.Poll ? message : sanitizeTextHtml(message),
      type,
    }))
    .refine(({ message }) => message === undefined || message.length <= MESSAGE_MAX_LENGTH)
    .refine(({ message, type }) => type !== MessageType.Poll || checkIsPollMessage(message)),
);
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;
