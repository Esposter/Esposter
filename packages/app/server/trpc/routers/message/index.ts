import type { CompositeKey } from "@/models/azure";
import type { SortItem } from "@/models/shared/pagination/sorting/SortItem";

import { selectRoomSchema } from "@/db/schema/rooms";
import { AzureTable } from "@/models/azure/table";
import { MessageEntity, messageSchema } from "@/models/esbabbler/message";
import { createCursorPaginationParamsSchema } from "@/models/shared/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "@/models/shared/pagination/sorting/SortOrder";
import { router } from "@/server/trpc";
import { getProfanityFilterMiddleware } from "@/server/trpc/middleware/getProfanityFilterMiddleware";
import { getRoomUserProcedure } from "@/server/trpc/procedure/getRoomUserProcedure";
import {
  createEntity,
  deleteEntity,
  getReverseTickedTimestamp,
  getTableClient,
  getTopNEntities,
  updateEntity,
} from "@/services/azure/table";
import { messageEventEmitter } from "@/services/esbabbler/events/message";
import { getMessagesPartitionKey, getMessagesPartitionKeyFilter } from "@/services/esbabbler/table";
import { getCursorPaginationData } from "@/services/shared/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@/services/shared/pagination/cursor/getCursorWhere";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

export const readMetadataInputSchema = z.object({
  messageRowKeys: z.array(messageSchema.shape.rowKey).min(1),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;

const readMessagesInputSchema = z
  .object({ roomId: selectRoomSchema.shape.id })
  // Azure table storage doesn't actually support sorting but remember that it is internally insert-sorted
  // as we insert our messages with a reverse-ticked timestamp as our rowkey
  // so unfortunately we have to provide a dummy default to keep the consistency here that cursor pagination
  // always requires a sortBy
  .merge(createCursorPaginationParamsSchema(messageSchema.keyof(), [{ key: "createdAt", order: SortOrder.Desc }]))
  .omit({ sortBy: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const onCreateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const createMessageInputSchema = z
  .object({ roomId: selectRoomSchema.shape.id })
  .merge(messageSchema.pick({ message: true }));
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

const onUpdateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const updateMessageInputSchema = messageSchema.pick({ message: true, partitionKey: true, rowKey: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;

const onDeleteMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

const deleteMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;

export const messageRouter = router({
  createMessage: getRoomUserProcedure(createMessageInputSchema, "roomId")
    .use(getProfanityFilterMiddleware(createMessageInputSchema, ["message"]))
    .input(createMessageInputSchema)
    .mutation(async ({ ctx, input }) => {
      const createdAt = new Date();
      const newMessage = new MessageEntity({
        createdAt,
        files: [],
        message: input.message,
        partitionKey: getMessagesPartitionKey(input.roomId, createdAt),
        rowKey: getReverseTickedTimestamp(),
        updatedAt: createdAt,
        userId: ctx.session.user.id,
      });
      const messageClient = await getTableClient(AzureTable.Messages);
      await createEntity(messageClient, newMessage);
      messageEventEmitter.emit("createMessage", newMessage);
      return newMessage;
    }),
  deleteMessage: getRoomUserProcedure(deleteMessageInputSchema, "partitionKey")
    .input(deleteMessageInputSchema)
    .mutation(async ({ input }) => {
      const messageClient = await getTableClient(AzureTable.Messages);
      await deleteEntity(messageClient, input.partitionKey, input.rowKey);
      messageEventEmitter.emit("deleteMessage", input);
      return input;
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
  readMessages: getRoomUserProcedure(readMessagesInputSchema, "roomId")
    .input(readMessagesInputSchema)
    .query(async ({ input: { cursor, limit, roomId } }) => {
      const sortBy: SortItem<keyof MessageEntity>[] = [{ key: "createdAt", order: SortOrder.Desc }];
      const filter = cursor
        ? `${getMessagesPartitionKeyFilter(roomId)} and ${getCursorWhereAzureTable(cursor, sortBy)}`
        : getMessagesPartitionKeyFilter(roomId);
      const messageClient = await getTableClient(AzureTable.Messages);
      const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, { filter });
      return getCursorPaginationData(messages, limit, sortBy);
    }),
  updateMessage: getRoomUserProcedure(updateMessageInputSchema, "partitionKey")
    .use(getProfanityFilterMiddleware(updateMessageInputSchema, ["message"]))
    .input(updateMessageInputSchema)
    .mutation(async ({ input }) => {
      const messageClient = await getTableClient(AzureTable.Messages);
      await updateEntity(messageClient, { ...input, updatedAt: new Date() });
      messageEventEmitter.emit("updateMessage", input);
      return input;
    }),
});
