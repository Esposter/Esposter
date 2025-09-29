import type { z } from "zod";

import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";

export const updateMessageInputSchema = messageEntitySchema
  .pick({
    mentions: true,
    message: true,
    partitionKey: true,
    rowKey: true,
  })
  .partial({ mentions: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
