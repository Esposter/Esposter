import type { z } from "zod";

import { messageEmojiMetadataEntitySchema } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

export const updateEmojiInputSchema = messageEmojiMetadataEntitySchema.pick({
  messageRowKey: true,
  partitionKey: true,
  rowKey: true,
});
export type UpdateEmojiInput = z.infer<typeof updateEmojiInputSchema>;
