import type { z } from "zod";

import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";

export const updateMessageInputSchema = messageEntitySchema
  .pick({ partitionKey: true, rowKey: true })
  // @TODO: oneOf([files, message])
  .extend(messageEntitySchema.pick({ files: true, message: true }).partial());

export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
