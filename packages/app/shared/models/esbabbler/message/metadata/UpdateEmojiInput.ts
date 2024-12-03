import type { z } from "zod";

import { messageEmojiMetadataSchema } from "#shared/models/esbabbler/message/metadata/emoji";

export const updateEmojiInputSchema = messageEmojiMetadataSchema.pick({
  messageRowKey: true,
  partitionKey: true,
  rowKey: true,
  userIds: true,
});
export type UpdateEmojiInput = z.infer<typeof updateEmojiInputSchema>;
