import type { z } from "zod";
import { messageEmojiMetadataEntitySchema } from "#src/models/message/metadata/MessageEmojiMetadataEntity";

export const deleteEmojiInputSchema = messageEmojiMetadataEntitySchema.pick({
  messageRowKey: true,
  partitionKey: true,
  rowKey: true,
});
export type DeleteEmojiInput = z.infer<typeof deleteEmojiInputSchema>;
