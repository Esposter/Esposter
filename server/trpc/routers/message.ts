import type { CompositeKey } from "@/models/azure";
import { MessageEntity, messageSchema } from "@/models/azure/message";
import { AzureTable } from "@/models/azure/table";
import { messageEventEmitter } from "@/models/events/message";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import {
  createEntity,
  deleteEntity,
  getReverseTickedTimestamp,
  getTableClient,
  getTopNEntities,
  updateEntity,
} from "@/services/azure/table";
import { getNextCursor, READ_LIMIT } from "@/utils/pagination";
import { odata } from "@azure/data-tables";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const readMessagesInputSchema = messageSchema
  .pick({ partitionKey: true })
  .merge(z.object({ cursor: z.string().nullable() }));
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const onCreateMessageInputSchema = messageSchema.pick({ partitionKey: true });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const createMessageInputSchema = messageSchema.pick({ partitionKey: true, message: true });
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

const onUpdateMessageInputSchema = messageSchema.pick({ partitionKey: true });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const updateMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true, message: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;

const onDeleteMessageInputSchema = messageSchema.pick({ partitionKey: true });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

const deleteMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;

export const messageRouter = router({
  readMessages: getRoomUserProcedure(readMessagesInputSchema, "partitionKey")
    .input(readMessagesInputSchema)
    .query(async ({ input: { partitionKey, cursor } }) => {
      const filter = cursor
        ? odata`PartitionKey eq ${partitionKey} and RowKey gt ${cursor}`
        : odata`PartitionKey eq ${partitionKey}`;
      const messageClient = await getTableClient(AzureTable.Messages);
      const messages = await getTopNEntities(messageClient, READ_LIMIT + 1, MessageEntity, { filter });
      return { messages, nextCursor: getNextCursor(messages, "rowKey", READ_LIMIT) };
    }),
  onCreateMessage: getRoomUserProcedure(onCreateMessageInputSchema, "partitionKey")
    .input(onCreateMessageInputSchema)
    .subscription(({ input }) =>
      observable<MessageEntity>((emit) => {
        const onCreateMessage = (data: MessageEntity) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        messageEventEmitter.on("onCreateMessage", onCreateMessage);
        return () => messageEventEmitter.off("onCreateMessage", onCreateMessage);
      })
    ),
  createMessage: getRoomUserProcedure(createMessageInputSchema, "partitionKey")
    .input(createMessageInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const createdAt = new Date();
        const newMessage: MessageEntity = {
          ...input,
          partitionKey: getMessagesPartitionKey(input.partitionKey, createdAt),
          rowKey: getReverseTickedTimestamp(),
          creatorId: ctx.session.user.id,
          files: [],
          createdAt,
        };
        const messageClient = await getTableClient(AzureTable.Messages);
        await createEntity<MessageEntity>(messageClient, {
          ...newMessage,
          files: newMessage.files,
        });
        const result = { ...input, ...newMessage };
        messageEventEmitter.emit("onCreateMessage", result);
        return result;
      } catch {
        return null;
      }
    }),
  onUpdateMessage: getRoomUserProcedure(onUpdateMessageInputSchema, "partitionKey")
    .input(onUpdateMessageInputSchema)
    .subscription(({ input }) =>
      observable<UpdateMessageInput>((emit) => {
        const onUpdateMessage = (data: UpdateMessageInput) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        messageEventEmitter.on("onUpdateMessage", onUpdateMessage);
        return () => messageEventEmitter.off("onUpdateMessage", onUpdateMessage);
      })
    ),
  updateMessage: getRoomUserProcedure(updateMessageInputSchema, "partitionKey")
    .input(updateMessageInputSchema)
    .mutation(async ({ input }) => {
      try {
        const messageClient = await getTableClient(AzureTable.Messages);
        await updateEntity<MessageEntity>(messageClient, input);
        messageEventEmitter.emit("onUpdateMessage", input);
        return input;
      } catch {
        return null;
      }
    }),
  onDeleteMessage: getRoomUserProcedure(onDeleteMessageInputSchema, "partitionKey")
    .input(onDeleteMessageInputSchema)
    .subscription(({ input }) =>
      observable<CompositeKey>((emit) => {
        const onDeleteMessage = (data: CompositeKey) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        messageEventEmitter.on("onDeleteMessage", onDeleteMessage);
        return () => messageEventEmitter.off("onDeleteMessage", onDeleteMessage);
      })
    ),
  deleteMessage: getRoomUserProcedure(deleteMessageInputSchema, "partitionKey")
    .input(deleteMessageInputSchema)
    .mutation(async ({ input }) => {
      try {
        const messageClient = await getTableClient(AzureTable.Messages);
        await deleteEntity(messageClient, input.partitionKey, input.rowKey);
        messageEventEmitter.emit("onDeleteMessage", input);
        return true;
      } catch {
        return false;
      }
    }),
});
