import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { selectRoomSchema } from "#shared/db/schema/rooms";
import { createMessageInputSchema } from "#shared/models/db/message/CreateMessageInput";
import { createTypingInputSchema } from "#shared/models/db/message/CreateTypingInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { MessageEntity, messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { deleteEntity } from "@@/server/services/azure/table/deleteEntity";
import { getReverseTickedTimestamp } from "@@/server/services/azure/table/getReverseTickedTimestamp";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { messageEventEmitter } from "@@/server/services/esbabbler/events/messageEventEmitter";
import { getMessagesPartitionKey } from "@@/server/services/esbabbler/getMessagesPartitionKey";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { isMessagesPartitionKeyForRoomId } from "@@/server/services/esbabbler/isMessagesPartitionKeyForRoomId";
import { on } from "@@/server/services/events/on";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhere";
import { router } from "@@/server/trpc";
import { getProfanityFilterMiddleware } from "@@/server/trpc/middleware/getProfanityFilterMiddleware";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { z } from "zod";

export const readMetadataInputSchema = z.interface({
  messageRowKeys: z.array(messageEntitySchema.shape.rowKey).min(1),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;

const readMessagesInputSchema =
  // Azure table storage doesn't actually support sorting but remember that it is internally insert-sorted
  // as we insert our messages with a reverse-ticked timestamp as our rowKey
  // so unfortunately we have to provide a dummy default to keep the consistency here that cursor pagination
  // always requires a sortBy even though we don't actually need the user to specify it
  createCursorPaginationParamsSchema(messageEntitySchema.keyof(), [{ key: "createdAt", order: SortOrder.Desc }])
    .extend(z.interface({ roomId: selectRoomSchema.shape.id }))
    .omit({ sortBy: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;
// @TODO: Use this for getting replies
const readMessagesByRowKeysInputSchema = z.interface({
  roomId: selectRoomSchema.shape.id,
  rowKeys: z.array(messageEntitySchema.shape.rowKey).min(1).max(MAX_READ_LIMIT),
});
export type ReadMessagesByRowKeysInput = z.infer<typeof readMessagesByRowKeysInputSchema>;

const onCreateMessageInputSchema = z.interface({ roomId: selectRoomSchema.shape.id });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const onUpdateMessageInputSchema = z.interface({ roomId: selectRoomSchema.shape.id });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const onCreateTypingInputSchema = z.interface({ roomId: selectRoomSchema.shape.id });
export type OnCreateTypingInput = z.infer<typeof onCreateTypingInputSchema>;

const onDeleteMessageInputSchema = z.interface({ roomId: selectRoomSchema.shape.id });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

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
      const messageClient = await useTableClient(AzureTable.Messages);
      await createEntity(messageClient, newMessage);
      messageEventEmitter.emit("createMessage", newMessage);
    }),
  createTyping: getRoomUserProcedure(createTypingInputSchema, "roomId")
    .input(createTypingInputSchema)
    // Query instead of mutation as there are no concurrency issues with ordering for simply emitting
    .query(({ input }) => {
      messageEventEmitter.emit("createTyping", input);
    }),
  deleteMessage: getRoomUserProcedure(deleteMessageInputSchema, "partitionKey")
    .input(deleteMessageInputSchema)
    .mutation(async ({ input }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      await deleteEntity(messageClient, input.partitionKey, input.rowKey);
      messageEventEmitter.emit("deleteMessage", input);
    }),
  onCreateMessage: getRoomUserProcedure(onCreateMessageInputSchema, "roomId")
    .input(onCreateMessageInputSchema)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(messageEventEmitter, "createMessage", { signal }))
        if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
    }),
  onCreateTyping: getRoomUserProcedure(onCreateTypingInputSchema, "roomId")
    .input(onCreateTypingInputSchema)
    .subscription(async function* ({ ctx, input, signal }) {
      // We will add typing inputs for self user in the frontend
      // without going through the server to avoid duplications and reduce performance overhead
      for await (const [data] of on(messageEventEmitter, "createTyping", { signal }))
        if (data.roomId === input.roomId && data.userId !== ctx.session.user.id) yield data;
    }),
  onDeleteMessage: getRoomUserProcedure(onDeleteMessageInputSchema, "roomId")
    .input(onDeleteMessageInputSchema)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(messageEventEmitter, "deleteMessage", { signal }))
        if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
    }),
  onUpdateMessage: getRoomUserProcedure(onUpdateMessageInputSchema, "roomId")
    .input(onUpdateMessageInputSchema)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(messageEventEmitter, "updateMessage", { signal }))
        if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
    }),
  readMessages: getRoomUserProcedure(readMessagesInputSchema, "roomId")
    .input(readMessagesInputSchema)
    .query(async ({ input: { cursor, limit, roomId } }) => {
      const sortBy: SortItem<keyof MessageEntity>[] = [{ key: "createdAt", order: SortOrder.Desc }];
      let filter = getMessagesPartitionKeyFilter(roomId);
      if (cursor) filter += ` and ${getCursorWhereAzureTable(cursor, sortBy)}`;
      const messageClient = await useTableClient(AzureTable.Messages);
      const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, { filter });
      return getCursorPaginationData(messages, limit, sortBy);
    }),
  readMessagesByRowKeys: getRoomUserProcedure(readMessagesByRowKeysInputSchema, "roomId")
    .input(readMessagesByRowKeysInputSchema)
    .query(async ({ input: { roomId, rowKeys } }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      return getTopNEntities(messageClient, rowKeys.length, MessageEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and (${rowKeys.map((rk) => `RowKey eq '${rk}'`).join(" or ")})`,
      });
    }),
  updateMessage: getRoomUserProcedure(updateMessageInputSchema, "partitionKey")
    .use(getProfanityFilterMiddleware(updateMessageInputSchema, ["message"]))
    .input(updateMessageInputSchema)
    .mutation(async ({ input }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      await updateEntity(messageClient, input);
      messageEventEmitter.emit("updateMessage", input);
    }),
});
