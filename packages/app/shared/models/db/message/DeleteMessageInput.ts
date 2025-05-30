import type { z } from "zod/v4";

import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";

export const deleteMessageInputSchema = messageEntitySchema.pick({
  partitionKey: true,
  rowKey: true,
});
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
