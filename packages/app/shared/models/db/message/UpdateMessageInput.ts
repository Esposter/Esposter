import type { z } from "zod";

import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
// @TODO: oneOf([files, message])
export const updateMessageInputSchema = messageEntitySchema.pick({
  files: true,
  message: true,
  partitionKey: true,
  rowKey: true,
});
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
