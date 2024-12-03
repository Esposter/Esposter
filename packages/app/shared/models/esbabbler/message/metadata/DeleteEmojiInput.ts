import type { z } from "zod";

import { messageEmojiMetadataEntitySchema } from "#shared/models/esbabbler/message/metadata/MessageEmojiMetadataEntity";

export const deleteEmojiInputSchema = messageEmojiMetadataEntitySchema.pick({
  messageRowKey: true,
  partitionKey: true,
  rowKey: true,
});
export type DeleteEmojiInput = z.infer<typeof deleteEmojiInputSchema>;
