import type { CompositeKey } from "@/models/azure";
import { MessageEntity, messageSchema } from "@/models/azure/message";
import { AzureTable } from "@/models/azure/table";
import { messageEventEmitter } from "@/models/events/message";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import { roomSchema } from "@/server/trpc/routers/room";
import {
  createEntity,
  deleteEntity,
  getMessagesPartitionKey,
  getMessagesPartitionKeyFilter,
  getReverseTickedTimestamp,
  getTableClient,
  getTopNEntities,
  updateEntity,
} from "@/services/azure/table";
import { getNextCursor, READ_LIMIT } from "@/utils/pagination";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

export const readMetadataInputSchema = z.object({
  roomId: z.string().uuid(),
  messages: z
    .array(
      messageSchema.pick({
        rowKey: true,
      })
    )
    .min(1),
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;

const readMessagesInputSchema = z.object({ roomId: z.string(), cursor: z.string().nullable() });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const onCreateMessageInputSchema = z.object({ roomId: roomSchema.shape.id });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const createMessageInputSchema = z.object({ roomId: z.string() }).merge(messageSchema.pick({ message: true }));
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

const onUpdateMessageInputSchema = z.object({ roomId: roomSchema.shape.id });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const updateMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true, message: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;

const onDeleteMessageInputSchema = z.object({ roomId: roomSchema.shape.id });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

const deleteMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;

export const messageRouter = router({
  readMessages: getRoomUserProcedure(readMessagesInputSchema, "roomId")
    .input(readMessagesInputSchema)
    .query(async ({ input: { roomId, cursor } }) => {
      const filter = cursor
        ? `${getMessagesPartitionKeyFilter(roomId)} and RowKey gt '${cursor}'`
        : getMessagesPartitionKeyFilter(roomId);
      const messageClient = await getTableClient(AzureTable.Messages);
      const messages = await getTopNEntities(messageClient, READ_LIMIT + 1, MessageEntity, { filter });
      return { messages, nextCursor: getNextCursor(messages, "rowKey", READ_LIMIT) };
    }),
  onCreateMessage: getRoomUserProcedure(onCreateMessageInputSchema, "roomId")
    .input(onCreateMessageInputSchema)
    .subscription(({ input }) =>
      observable<MessageEntity>((emit) => {
        const onCreateMessage = (data: MessageEntity) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        messageEventEmitter.on("onCreateMessage", onCreateMessage);
        return () => messageEventEmitter.off("onCreateMessage", onCreateMessage);
      })
    ),
  createMessage: getRoomUserProcedure(createMessageInputSchema, "roomId")
    .input(createMessageInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const createdAt = new Date();
        const newMessage: MessageEntity = {
          partitionKey: getMessagesPartitionKey(input.roomId, createdAt),
          rowKey: getReverseTickedTimestamp(),
          creatorId: ctx.session.user.id,
          message: input.message,
          files: [],
          createdAt,
        };
        const messageClient = await getTableClient(AzureTable.Messages);
        await createEntity<MessageEntity>(messageClient, newMessage);
        messageEventEmitter.emit("onCreateMessage", newMessage);
        return newMessage;
      } catch {
        return null;
      }
    }),
  onUpdateMessage: getRoomUserProcedure(onUpdateMessageInputSchema, "roomId")
    .input(onUpdateMessageInputSchema)
    .subscription(({ input }) =>
      observable<UpdateMessageInput>((emit) => {
        const onUpdateMessage = (data: UpdateMessageInput) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
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
  onDeleteMessage: getRoomUserProcedure(onDeleteMessageInputSchema, "roomId")
    .input(onDeleteMessageInputSchema)
    .subscription(({ input }) =>
      observable<CompositeKey>((emit) => {
        const onDeleteMessage = (data: CompositeKey) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
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
