import { createRouter } from "@/server/trpc/createRouter";
import type { AzureMessageEntity, MessageEntity } from "@/services/azure/types";
import { AzureTable } from "@/services/azure/types";
import { FETCH_LIMIT, MESSAGE_MAX_LENGTH } from "@/util/constants";
import { RemoveIndexSignature } from "@/util/types";
import { odata } from "@azure/data-tables";
import { toZod } from "tozod";
import { z } from "zod";
import { getTableClient, getTopNEntities, submitTransaction } from "~~/services/azure/table";

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

export const messageRouter = createRouter()
  .query("readMessages", {
    input: readMessagesInputSchema,
    resolve: async ({ input }) => {
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
    },
  })
  .mutation("createMessage", {
    input: createMessageInputSchema,
    resolve: async ({ input }) => {
      const messageClient = await getTableClient(AzureTable.Messages);
      // Auto create properties we know from the backend
      const message: MessageEntity = { ...input, userId: "1", createdAt: new Date() };
      const successful = await submitTransaction(messageClient, [["create", message]]);
      return successful ? message : null;
    },
  })
  .mutation("updateMessage", {
    input: updateMessageInputSchema,
    resolve: async ({ input }) => {
      const messageClient = await getTableClient(AzureTable.Messages);
      const successful = await submitTransaction(messageClient, [["update", input]]);
      return successful ? input : null;
    },
  })
  .mutation("deleteMessage", {
    input: deleteMessageInputSchema,
    resolve: async ({ input }) => {
      const messageClient = await getTableClient(AzureTable.Messages);
      return submitTransaction(messageClient, [["delete", input]]);
    },
  });
