import { selectRoomSchema } from "@/db/schema/rooms";
import { type CompositeKey } from "@/models/azure";
import { AzureTable } from "@/models/azure/table";
import { messageEventEmitter } from "@/models/esbabbler/events/message";
import { MessageEntity, messageSchema } from "@/models/esbabbler/message";
import { createCursorPaginationParamsSchema } from "@/models/shared/pagination/CursorPaginationParams";
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
import { getMessagesPartitionKey, getMessagesPartitionKeyFilter } from "@/services/esbabbler/table";
import { getCursorPaginationData } from "@/services/shared/pagination/getCursorPaginationData";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

export const readMetadataInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  messageRowKeys: z.array(messageSchema.shape.rowKey).min(1),
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;

const readMessagesInputSchema = z
  .object({ roomId: selectRoomSchema.shape.id })
  // Azure table storage doesn't support sorting
  .merge(createCursorPaginationParamsSchema(messageSchema.keyof()).omit({ sortBy: true }));
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const onCreateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const createMessageInputSchema = z
  .object({ roomId: selectRoomSchema.shape.id })
  .merge(messageSchema.pick({ message: true }));
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

const onUpdateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const updateMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true, message: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;

const onDeleteMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

const deleteMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;

export const messageRouter = router({
  readMessages: getRoomUserProcedure(readMessagesInputSchema, "roomId")
    .input(readMessagesInputSchema)
    .query(async ({ input: { roomId, cursor, limit } }) => {
      const filter = cursor
        ? `${getMessagesPartitionKeyFilter(roomId)} and RowKey gt '${cursor}'`
        : getMessagesPartitionKeyFilter(roomId);
      const messageClient = await getTableClient(AzureTable.Messages);
      const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, { filter });
      return getCursorPaginationData(messages, "rowKey", limit);
    }),
  onCreateMessage: getRoomUserProcedure(onCreateMessageInputSchema, "roomId")
    .input(onCreateMessageInputSchema)
    .subscription(({ input }) =>
      observable<MessageEntity>((emit) => {
        const onCreateMessage = (data: MessageEntity) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        messageEventEmitter.on("createMessage", onCreateMessage);
        return () => messageEventEmitter.off("createMessage", onCreateMessage);
      }),
    ),
  createMessage: getRoomUserProcedure(createMessageInputSchema, "roomId")
    .input(createMessageInputSchema)
    .mutation(async ({ input, ctx }) => {
      const createdAt = new Date();
      const newMessage = new MessageEntity({
        partitionKey: getMessagesPartitionKey(input.roomId, createdAt),
        rowKey: getReverseTickedTimestamp(),
        creatorId: ctx.session.user.id,
        message: input.message,
        files: [],
        createdAt,
        updatedAt: createdAt,
      });
      const messageClient = await getTableClient(AzureTable.Messages);
      await createEntity(messageClient, newMessage);
      messageEventEmitter.emit("createMessage", newMessage);
      return newMessage;
    }),
  onUpdateMessage: getRoomUserProcedure(onUpdateMessageInputSchema, "roomId")
    .input(onUpdateMessageInputSchema)
    .subscription(({ input }) =>
      observable<UpdateMessageInput>((emit) => {
        const onUpdateMessage = (data: UpdateMessageInput) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        messageEventEmitter.on("updateMessage", onUpdateMessage);
        return () => messageEventEmitter.off("updateMessage", onUpdateMessage);
      }),
    ),
  updateMessage: getRoomUserProcedure(updateMessageInputSchema, "partitionKey")
    .input(updateMessageInputSchema)
    .mutation(async ({ input }) => {
      const messageClient = await getTableClient(AzureTable.Messages);
      await updateEntity(messageClient, { ...input, updatedAt: new Date() });
      messageEventEmitter.emit("updateMessage", input);
      return input;
    }),
  onDeleteMessage: getRoomUserProcedure(onDeleteMessageInputSchema, "roomId")
    .input(onDeleteMessageInputSchema)
    .subscription(({ input }) =>
      observable<CompositeKey>((emit) => {
        const onDeleteMessage = (data: CompositeKey) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        messageEventEmitter.on("deleteMessage", onDeleteMessage);
        return () => messageEventEmitter.off("deleteMessage", onDeleteMessage);
      }),
    ),
  deleteMessage: getRoomUserProcedure(deleteMessageInputSchema, "partitionKey")
    .input(deleteMessageInputSchema)
    .mutation(async ({ input }) => {
      const messageClient = await getTableClient(AzureTable.Messages);
      await deleteEntity(messageClient, input.partitionKey, input.rowKey);
      messageEventEmitter.emit("deleteMessage", input);
    }),
});
