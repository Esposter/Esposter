import { messageEmojiMetadataEntitySchema } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

export const deleteEmojiInputSchema = messageEmojiMetadataEntitySchema.pick("partitionKey", "rowKey", "messageRowKey");
export type DeleteEmojiInput = typeof deleteEmojiInputSchema.infer;
