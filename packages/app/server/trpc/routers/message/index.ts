import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { selectRoomSchema } from "#shared/db/schema/rooms";
import { createMessageInputSchema } from "#shared/models/db/message/CreateMessageInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { MessageEntity, messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { deleteEntity } from "@@/server/services/azure/table/deleteEntity";
import { getReverseTickedTimestamp } from "@@/server/services/azure/table/getReverseTickedTimestamp";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { messageEventEmitter } from "@@/server/services/esbabbler/events/messageEventEmitter";
import { getMessagesPartitionKey } from "@@/server/services/esbabbler/getMessagesPartitionKey";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhere";
import { router } from "@@/server/trpc";
import { getProfanityFilterMiddleware } from "@@/server/trpc/middleware/getProfanityFilterMiddleware";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { useTableClient } from "@@/server/util/azure/useTableClient";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

export const readMetadataInputSchema = z.object({
  messageRowKeys: z.array(messageEntitySchema.shape.rowKey).min(1),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;

const readMessagesInputSchema = z
  .object({ roomId: selectRoomSchema.shape.id })
  // Azure table storage doesn't actually support sorting but remember that it is internally insert-sorted
  // as we insert our messages with a reverse-ticked timestamp as our rowkey
  // so unfortunately we have to provide a dummy default to keep the consistency here that cursor pagination
  // always requires a sortBy
  .merge(createCursorPaginationParamsSchema(messageEntitySchema.keyof(), [{ key: "createdAt", order: SortOrder.Desc }]))
  .omit({ sortBy: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const onCreateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const onUpdateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const onDeleteMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

export const messageRouter = router({
  createMessage: getRoomUserProcedure(createMessageInputSchema, "roomId")
    .use(getProfanityFilterMiddleware(createMessageInputSchema, ["message"]))
    .input(createMessageInputSchema)
    .mutation<MessageEntity>(async ({ ctx, input }) => {
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
      const messageClient = await useTableClient(AzureTable.Messages);
      await createEntity(messageClient, newMessage);
      messageEventEmitter.emit("createMessage", newMessage);
      return newMessage;
    }),
  deleteMessage: getRoomUserProcedure(deleteMessageInputSchema, "partitionKey")
    .input(deleteMessageInputSchema)
    .mutation(async ({ input }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      await deleteEntity(messageClient, input.partitionKey, input.rowKey);
      messageEventEmitter.emit("deleteMessage", input);
      return input;
    }),
  onCreateMessage: getRoomUserProcedure(onCreateMessageInputSchema, "roomId")
    .input(onCreateMessageInputSchema)
    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
      const messageClient = await useTableClient(AzureTable.Messages);
      const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, { filter });
      return getCursorPaginationData(messages, limit, sortBy);
    }),
  updateMessage: getRoomUserProcedure(updateMessageInputSchema, "partitionKey")
    .use(getProfanityFilterMiddleware(updateMessageInputSchema, ["message"]))
    .input(updateMessageInputSchema)
    .mutation(async ({ input }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      await updateEntity(messageClient, { ...input, updatedAt: new Date() });
      messageEventEmitter.emit("updateMessage", input);
      return input;
    }),
});
