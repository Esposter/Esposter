import { odata } from "@azure/data-tables";
import { toZod } from "tozod";
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { testUser } from "@/server/trpc/routers";
import { getTableClient, getTopNEntities, submitTransaction } from "@/services/azure/table";
import type { AzureMessageEntity, MessageEntity } from "@/services/azure/types";
import { AzureTable } from "@/services/azure/types";
import { FETCH_LIMIT, MESSAGE_MAX_LENGTH } from "@/util/constants.common";
import { RemoveIndexSignature } from "@/util/types";

const messageSchema: toZod<RemoveIndexSignature<MessageEntity>> = z.object({
  partitionKey: z.string().uuid(),
  rowKey: z.string(),
  userId: z.string().uuid(),
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  createdAt: z.date(),
});

const readMessagesInputSchema = z.object({
  filter: messageSchema.pick({ partitionKey: true }),
  cursor: z.string().nullable(),
});
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const createMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true, message: true });
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

const updateMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true, message: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;

const deleteMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;

export const messageRouter = router({
  readMessages: publicProcedure.input(readMessagesInputSchema).query(async ({ input }) => {
    const filter = input.cursor
      ? odata`PartitionKey eq ${input.filter.partitionKey} and RowKey gt ${input.cursor}`
      : odata`PartitionKey eq ${input.filter.partitionKey}`;
    const realFetchLimit = FETCH_LIMIT + 1;
    const messageClient = await getTableClient(AzureTable.Messages);
    const messages = await getTopNEntities<AzureMessageEntity>(messageClient, realFetchLimit, { filter });

    let nextCursor: typeof input.cursor = null;
    if (messages.length > FETCH_LIMIT) {
      const nextMessage = messages.pop();
      if (nextMessage) nextCursor = nextMessage.rowKey;
    }

    const messageEntities: MessageEntity[] = [];
    for (const message of messages) messageEntities.push({ ...message, createdAt: new Date(message.createdAt) });
    return { messages: messageEntities, nextCursor };
  }),
  createMessage: publicProcedure.input(createMessageInputSchema).mutation(async ({ input }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    // Auto create properties we know from the backend
    const message: MessageEntity = { ...input, userId: testUser.id, createdAt: new Date() };
    const successful = await submitTransaction(messageClient, [["create", message]]);
    return successful ? message : null;
  }),
  updateMessage: publicProcedure.input(updateMessageInputSchema).mutation(async ({ input }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    const successful = await submitTransaction(messageClient, [["update", input]]);
    return successful ? input : null;
  }),
  deleteMessage: publicProcedure.input(deleteMessageInputSchema).mutation(async ({ input }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    return submitTransaction(messageClient, [["delete", input]]);
  }),
});
