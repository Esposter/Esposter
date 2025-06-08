import type { AzureUpdateEntity } from "#shared/models/azure/AzureUpdateEntity";
import type { FileSasEntity } from "#shared/models/esbabbler/FileSasEntity";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { selectRoomSchema } from "#shared/db/schema/rooms";
import { AzureEntityType } from "#shared/models/azure/AzureEntityType";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { FileEntity, fileEntitySchema } from "#shared/models/azure/FileEntity";
import { createMessageInputSchema } from "#shared/models/db/message/CreateMessageInput";
import { createTypingInputSchema } from "#shared/models/db/message/CreateTypingInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { MessageEntity, messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { cloneFiles } from "@@/server/services/azure/container/cloneFiles";
import { deleteFiles } from "@@/server/services/azure/container/deleteFiles";
import { generateDownloadFileSasUrls } from "@@/server/services/azure/container/generateDownloadFileSasUrls";
import { generateUploadFileSasEntities } from "@@/server/services/azure/container/generateUploadFileSasEntities";
import { getBlobName } from "@@/server/services/azure/container/getBlobName";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { deleteEntity } from "@@/server/services/azure/table/deleteEntity";
import { getEntity } from "@@/server/services/azure/table/getEntity";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { createMessageEntity } from "@@/server/services/esbabbler/createMessageEntity";
import { messageEventEmitter } from "@@/server/services/esbabbler/events/messageEventEmitter";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { isMessagesPartitionKeyForRoomId } from "@@/server/services/esbabbler/isMessagesPartitionKeyForRoomId";
import { updateMessage } from "@@/server/services/esbabbler/updateMessage";
import { on } from "@@/server/services/events/on";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { router } from "@@/server/trpc";
import { addProfanityFilterMiddleware } from "@@/server/trpc/middleware/addProfanityFilterMiddleware";
import { getCreatorProcedure } from "@@/server/trpc/procedure/message/getCreatorProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

export const readMetadataInputSchema = z.object({
  messageRowKeys: messageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;

const readMessagesInputSchema =
  // Azure table storage doesn't actually support sorting but remember that it is internally insert-sorted
  // as we insert our messages with a reverse-ticked timestamp as our rowKey
  // so unfortunately we have to provide a dummy default to keep the consistency here that cursor pagination
  // always requires a sortBy even though we don't actually need the user to specify it
  z
    .object({
      ...createCursorPaginationParamsSchema(messageEntitySchema.keyof(), [{ key: "createdAt", order: SortOrder.Desc }])
        .shape,
      roomId: selectRoomSchema.shape.id,
    })
    .omit({ sortBy: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const readMessagesByRowKeysInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  rowKeys: messageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
});
export type ReadMessagesByRowKeysInput = z.infer<typeof readMessagesByRowKeysInputSchema>;

const generateUploadFileSasEntitiesInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type GenerateUploadFileSasEntitiesInput = z.infer<typeof generateUploadFileSasEntitiesInputSchema>;

const generateDownloadFileSasUrlsInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, id: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type GenerateDownloadFileSasUrlsInput = z.infer<typeof generateDownloadFileSasUrlsInputSchema>;

const deleteFileInputSchema = z.object({
  ...messageEntitySchema.pick({ partitionKey: true, rowKey: true }).shape,
  id: fileEntitySchema.shape.id,
});
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;

const deleteLinkPreviewResponseInputSchema = messageEntitySchema.pick({ partitionKey: true, rowKey: true });
export type DeleteLinkPreviewResponseInput = z.infer<typeof deleteLinkPreviewResponseInputSchema>;

const onCreateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const onUpdateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const onCreateTypingInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateTypingInput = z.infer<typeof onCreateTypingInputSchema>;

const onDeleteMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

export const forwardMessagesInputSchema = z.object({
  ...messageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true }).shape,
  roomIds: selectRoomSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type ForwardMessagesInput = z.infer<typeof forwardMessagesInputSchema>;

export const messageRouter = router({
  createMessage: addProfanityFilterMiddleware(getMemberProcedure(createMessageInputSchema, "roomId"), [
    "message",
  ]).mutation<MessageEntity>(async ({ ctx, input }) => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const newMessageEntity = await createMessageEntity({ ...input, userId: ctx.session.user.id });
    await createEntity(messageClient, newMessageEntity);
    messageEventEmitter.emit("createMessage", [[newMessageEntity]]);
    return newMessageEntity;
  }),
  createTyping: getMemberProcedure(createTypingInputSchema, "roomId")
    // Query instead of mutation as there are no concurrency issues with ordering for simply emitting
    .query(({ input }) => {
      messageEventEmitter.emit("createTyping", input);
    }),
  deleteFile: getCreatorProcedure(deleteFileInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity, roomId }, input: { id, partitionKey, rowKey } }) => {
      if (messageEntity.isForward || messageEntity.files.length === 0) throw new TRPCError({ code: "BAD_REQUEST" });

      const index = messageEntity.files.findIndex((f) => f.id === id);
      if (index === -1)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(AzureEntityType.File, id).message,
        });

      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      const blobName = getBlobName(`${roomId}/${id}`, messageEntity.files.splice(index, 1)[0].filename);
      const updatedMessageEntity = {
        files: messageEntity.files,
        partitionKey,
        rowKey,
      } as const satisfies AzureUpdateEntity<MessageEntity>;
      await updateMessage(messageClient, updatedMessageEntity);
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);
      await containerClient.deleteBlob(blobName);
    },
  ),
  deleteLinkPreviewResponse: getCreatorProcedure(deleteLinkPreviewResponseInputSchema).mutation(
    async ({ ctx: { messageClient }, input }) => {
      const updatedMessageEntity = {
        ...input,
        linkPreviewResponse: null,
      } as const satisfies AzureUpdateEntity<MessageEntity>;
      await updateMessage(messageClient, updatedMessageEntity);
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);
    },
  ),
  deleteMessage: getCreatorProcedure(deleteMessageInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity }, input }) => {
      await deleteEntity(messageClient, input.partitionKey, input.rowKey);
      messageEventEmitter.emit("deleteMessage", input);

      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      await deleteFiles(containerClient, messageEntity.files);
    },
  ),
  forwardMessages: getMemberProcedure(forwardMessagesInputSchema, "partitionKey").mutation(
    async ({ ctx, input: { message, partitionKey, roomIds, rowKey } }) => {
      const foundUsersToRooms = await ctx.db.query.usersToRooms.findMany({
        where: (usersToRooms, { and, eq, inArray }) =>
          and(eq(usersToRooms.userId, ctx.session.user.id), inArray(usersToRooms.roomId, roomIds)),
      });
      if (foundUsersToRooms.length !== roomIds.length) throw new TRPCError({ code: "UNAUTHORIZED" });

      const messageClient = await useTableClient(AzureTable.Messages);
      const messageEntity = await getEntity(messageClient, MessageEntity, partitionKey, rowKey);
      if (!messageEntity)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(messageRouter.forwardMessages.name, JSON.stringify({ partitionKey, rowKey }))
            .message,
        });

      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      await Promise.all(
        roomIds.map(async (roomId) => {
          const newFileIds = await cloneFiles(containerClient, messageEntity.files, ctx.roomId, roomId);
          const forward = await createMessageEntity({
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            files: messageEntity.files.map((file, index) => new FileEntity({ ...file, id: newFileIds[index] })),
            isForward: true,
            message: messageEntity.message,
            // We don't forward reply information for privacy
            replyRowKey: undefined,
            roomId,
            userId: ctx.session.user.id,
          });
          await createEntity(messageClient, forward);
          const messages = [forward];

          if (message) {
            const newMessageEntity = await createMessageEntity({ message, roomId, userId: ctx.session.user.id });
            await createEntity(messageClient, newMessageEntity);
            messages.push(newMessageEntity);
          }
          // We don't need visual effects like isLoading when forwarding messages
          // so we'll instead rely on the subscription to auto-add the forwarded message for convenience
          messageEventEmitter.emit("createMessage", [messages, true]);
        }),
      );
    },
  ),
  generateDownloadFileSasUrls: getMemberProcedure(generateDownloadFileSasUrlsInputSchema, "roomId").query<string[]>(
    async ({ input: { files, roomId } }) => {
      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      return generateDownloadFileSasUrls(containerClient, files, roomId);
    },
  ),
  generateUploadFileSasEntities: getMemberProcedure(generateUploadFileSasEntitiesInputSchema, "roomId").query<
    FileSasEntity[]
  >(async ({ input: { files, roomId } }) => {
    const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
    return generateUploadFileSasEntities(containerClient, files, roomId);
  }),
  onCreateMessage: getMemberProcedure(onCreateMessageInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [[data, isIncludesSelf]] of on(messageEventEmitter, "createMessage", { signal })) {
      const dataToYield: MessageEntity[] = [];

      for (const newMessage of data)
        if (
          isMessagesPartitionKeyForRoomId(newMessage.partitionKey, input.roomId) &&
          (isIncludesSelf || newMessage.userId !== ctx.session.user.id)
        )
          dataToYield.push(newMessage);

      yield dataToYield;
    }
  }),
  onCreateTyping: getMemberProcedure(onCreateTypingInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    // We will add typing inputs for self user in the frontend
    // without going through the server to avoid duplications and reduce performance overhead
    for await (const [data] of on(messageEventEmitter, "createTyping", { signal }))
      if (data.roomId === input.roomId && data.userId !== ctx.session.user.id) yield data;
  }),
  onDeleteMessage: getMemberProcedure(onDeleteMessageInputSchema, "roomId").subscription(async function* ({
    input,
    signal,
  }) {
    for await (const [data] of on(messageEventEmitter, "deleteMessage", { signal }))
      if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
  }),
  onUpdateMessage: getMemberProcedure(onUpdateMessageInputSchema, "roomId").subscription(async function* ({
    input,
    signal,
  }) {
    for await (const [data] of on(messageEventEmitter, "updateMessage", { signal }))
      if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
  }),
  readMessages: getMemberProcedure(readMessagesInputSchema, "roomId").query(
    async ({ input: { cursor, limit, roomId } }) => {
      const sortBy: SortItem<keyof MessageEntity>[] = [{ key: "rowKey", order: SortOrder.Asc }];
      let filter = getMessagesPartitionKeyFilter(roomId);
      if (cursor) filter += ` and ${getCursorWhereAzureTable(cursor, sortBy)}`;
      const messageClient = await useTableClient(AzureTable.Messages);
      const messages = await getTopNEntities(messageClient, limit + 1, MessageEntity, { filter });
      return getCursorPaginationData(messages, limit, sortBy);
    },
  ),
  readMessagesByRowKeys: getMemberProcedure(readMessagesByRowKeysInputSchema, "roomId").query(
    async ({ input: { roomId, rowKeys } }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      return getTopNEntities(messageClient, rowKeys.length, MessageEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and (${rowKeys.map((rk) => `RowKey eq '${rk}'`).join(" or ")})`,
      });
    },
  ),
  updateMessage: addProfanityFilterMiddleware(getCreatorProcedure(updateMessageInputSchema), ["message"]).mutation(
    async ({ ctx: { messageClient }, input }) => {
      await updateMessage(messageClient, input);
      messageEventEmitter.emit("updateMessage", input);
    },
  ),
});
