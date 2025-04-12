import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";

export const deleteMessageInputSchema = messageEntitySchema.pick("partitionKey", "rowKey");
export type DeleteMessageInput = typeof deleteMessageInputSchema.infer;
