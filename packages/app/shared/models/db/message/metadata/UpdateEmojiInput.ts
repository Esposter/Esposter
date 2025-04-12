import { messageEmojiMetadataEntitySchema } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

export const updateEmojiInputSchema = messageEmojiMetadataEntitySchema.pick(
  "partitionKey",
  "rowKey",
  "messageRowKey",
  "userIds",
);
export type UpdateEmojiInput = typeof updateEmojiInputSchema.infer;
