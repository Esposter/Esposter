import { testUser } from "@/assets/data/test";
import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";
import { getTableClient, getTopNEntities, submitTransaction } from "@/services/azure/table";
import { AzureTable, MessageEntity } from "@/services/azure/types";
import { getReverseTickedTimestamp } from "@/services/azure/util";
import { FETCH_LIMIT, MESSAGE_MAX_LENGTH } from "@/util/constants.common";
import { getNextCursor } from "@/util/pagination";
import { odata } from "@azure/data-tables";
import { toZod } from "tozod";
import { z } from "zod";

const messageSchema: toZod<MessageEntity> = z.object({
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

const createMessageInputSchema = messageSchema.pick({ partitionKey: true, message: true });
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

const updateMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true, message: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;

const deleteMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;

export const messageRouter = router({
  readMessages: rateLimitedProcedure.input(readMessagesInputSchema).query(async ({ input }) => {
    const filter = input.cursor
      ? odata`PartitionKey eq ${input.filter.partitionKey} and RowKey gt ${input.cursor}`
      : odata`PartitionKey eq ${input.filter.partitionKey}`;
    const messageClient = await getTableClient(AzureTable.Messages);
    const messages = await getTopNEntities(messageClient, FETCH_LIMIT + 1, MessageEntity, { filter });
    return { messages, nextCursor: getNextCursor(messages, "rowKey", FETCH_LIMIT) };
  }),
  createMessage: rateLimitedProcedure.input(createMessageInputSchema).mutation(async ({ input }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    // Auto create properties we know from the backend
    const message: MessageEntity = {
      ...input,
      rowKey: getReverseTickedTimestamp(),
      userId: testUser.id,
      createdAt: new Date(),
    };
    const successful = await submitTransaction(messageClient, [["create", message]]);
    return successful ? message : null;
  }),
  updateMessage: rateLimitedProcedure.input(updateMessageInputSchema).mutation(async ({ input }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    const successful = await submitTransaction(messageClient, [["update", input]]);
    return successful ? input : null;
  }),
  deleteMessage: rateLimitedProcedure.input(deleteMessageInputSchema).mutation(async ({ input }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    return submitTransaction(messageClient, [["delete", input]]);
  }),
});
