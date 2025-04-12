import { messageEmojiMetadataEntitySchema } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

export const createEmojiInputSchema = messageEmojiMetadataEntitySchema.pick(
  "partitionKey",
  "messageRowKey",
  "emojiTag",
);
export type CreateEmojiInput = typeof createEmojiInputSchema.infer;
