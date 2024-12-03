import type { z } from "zod";

import { messageEmojiMetadataSchema } from "#shared/models/esbabbler/message/metadata/emoji";

export const deleteEmojiInputSchema = messageEmojiMetadataSchema.pick({
  messageRowKey: true,
  partitionKey: true,
  rowKey: true,
});
export type DeleteEmojiInput = z.infer<typeof deleteEmojiInputSchema>;
