import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";

export const updateMessageInputSchema = messageEntitySchema.pick("partitionKey", "rowKey", "message");
export type UpdateMessageInput = typeof updateMessageInputSchema.infer;
