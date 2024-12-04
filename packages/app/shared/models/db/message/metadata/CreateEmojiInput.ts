import type { z } from "zod";

import { messageEmojiMetadataEntitySchema } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

export const createEmojiInputSchema = messageEmojiMetadataEntitySchema.pick({
  emojiTag: true,
  messageRowKey: true,
  partitionKey: true,
});
export type CreateEmojiInput = z.infer<typeof createEmojiInputSchema>;
