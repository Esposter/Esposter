import { router } from "@/server/trpc";
import { customEventEmitter } from "@/server/trpc/events";
import { authedProcedure } from "@/server/trpc/procedure";
import { getTableClient, getTopNEntities, submitTransaction } from "@/services/azure/table";
import { AzureTable, MessageEntity } from "@/services/azure/types";
import { getReverseTickedTimestamp } from "@/services/azure/util";
import { FETCH_LIMIT, MESSAGE_MAX_LENGTH } from "@/util/constants.common";
import { getNextCursor } from "@/util/pagination";
import { odata } from "@azure/data-tables";
import { observable } from "@trpc/server/observable";
import type { toZod } from "tozod";
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
  readMessages: authedProcedure.input(readMessagesInputSchema).query(async ({ input }) => {
    const filter = input.cursor
      ? odata`PartitionKey eq ${input.filter.partitionKey} and RowKey gt ${input.cursor}`
      : odata`PartitionKey eq ${input.filter.partitionKey}`;
    const messageClient = await getTableClient(AzureTable.Messages);
    const messages = await getTopNEntities(messageClient, FETCH_LIMIT + 1, MessageEntity, { filter });
    return { messages, nextCursor: getNextCursor(messages, "rowKey", FETCH_LIMIT) };
  }),
  onCreateMessage: authedProcedure.subscription(() =>
    observable<MessageEntity>((emit) => {
      const onCreateMessage = (data: MessageEntity) => emit.next(data);
      customEventEmitter.on("onCreateMessage", onCreateMessage);
      return () => {
        customEventEmitter.off("onCreateMessage", onCreateMessage);
      };
    })
  ),
  createMessage: authedProcedure.input(createMessageInputSchema).mutation(async ({ input, ctx }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    // Auto create properties we know from the backend
    const message: MessageEntity = {
      ...input,
      rowKey: getReverseTickedTimestamp(),
      userId: ctx.session.user.id,
      createdAt: new Date(),
    };
    const successful = await submitTransaction(messageClient, [["create", message]]);
    if (!successful) return null;

    customEventEmitter.emit("onCreateMessage", message);
    return message;
  }),
  updateMessage: authedProcedure.input(updateMessageInputSchema).mutation(async ({ input }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    const successful = await submitTransaction(messageClient, [["update", input]]);
    return successful ? input : null;
  }),
  deleteMessage: authedProcedure.input(deleteMessageInputSchema).mutation(async ({ input }) => {
    const messageClient = await getTableClient(AzureTable.Messages);
    return submitTransaction(messageClient, [["delete", input]]);
  }),
});
