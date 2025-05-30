import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { z } from "zod/v4";

export const updateMessageInputSchema = z.object({
  ...messageEntitySchema.pick({ partitionKey: true, rowKey: true }).shape,
  // @TODO: oneOf([files, message])
  ...messageEntitySchema.pick({ files: true, message: true }).partial().shape,
});
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
