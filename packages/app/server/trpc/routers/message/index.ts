import type { FileSasEntity } from "#shared/models/esbabbler/FileSasEntity";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { AzureUpdateEntity } from "@@/shared/models/azure/AzureUpdateEntity";

import { selectRoomSchema } from "#shared/db/schema/rooms";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { FileEntity, fileEntitySchema } from "#shared/models/azure/FileEntity";
import { createMessageInputSchema } from "#shared/models/db/message/CreateMessageInput";
import { createTypingInputSchema } from "#shared/models/db/message/CreateTypingInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { MessageEntity, messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { dayjs } from "#shared/services/dayjs";
import { createMessageEntity } from "#shared/services/esbabbler/createMessageEntity";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { cloneFiles } from "@@/server/services/azure/container/cloneFiles";
import { deleteFiles } from "@@/server/services/azure/container/deleteFiles";
import { generateDownloadFileSasUrls } from "@@/server/services/azure/container/generateDownloadFileSasUrls";
import { getBlobName } from "@@/server/services/azure/container/getBlobName";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { deleteEntity } from "@@/server/services/azure/table/deleteEntity";
import { getEntity } from "@@/server/services/azure/table/getEntity";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { messageEventEmitter } from "@@/server/services/esbabbler/events/messageEventEmitter";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { isMessagesPartitionKeyForRoomId } from "@@/server/services/esbabbler/isMessagesPartitionKeyForRoomId";
import { on } from "@@/server/services/events/on";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhere";
import { router } from "@@/server/trpc";
import { getProfanityFilterMiddleware } from "@@/server/trpc/middleware/getProfanityFilterMiddleware";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const readMetadataInputSchema = z.object({
  messageRowKeys: messageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;

const readMessagesInputSchema = z
  .object({ roomId: selectRoomSchema.shape.id })
  // Azure table storage doesn't actually support sorting but remember that it is internally insert-sorted
  // as we insert our messages with a reverse-ticked timestamp as our rowKey
  // so unfortunately we have to provide a dummy default to keep the consistency here that cursor pagination
  // always requires a sortBy even though we don't actually need the user to specify it
  .merge(createCursorPaginationParamsSchema(messageEntitySchema.keyof(), [{ key: "createdAt", order: SortOrder.Desc }]))
  .omit({ sortBy: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const readMessagesByRowKeysInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  rowKeys: messageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
});
export type ReadMessagesByRowKeysInput = z.infer<typeof readMessagesByRowKeysInputSchema>;

const generateUploadFileSasUrlsInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type GenerateUploadFileSasUrlsInput = z.infer<typeof generateUploadFileSasUrlsInputSchema>;

const generateDownloadFileSasUrlsInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, id: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type GenerateDownloadFileSasUrlsInput = z.infer<typeof generateDownloadFileSasUrlsInputSchema>;

const deleteFileInputSchema = messageEntitySchema.pick({ partitionKey: true, rowKey: true }).merge(
  z.object({
    id: fileEntitySchema.shape.id,
  }),
);
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;

const onCreateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const onUpdateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const onCreateTypingInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateTypingInput = z.infer<typeof onCreateTypingInputSchema>;

const onDeleteMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

export const forwardMessagesInputSchema = messageEntitySchema
  .pick({ message: true, partitionKey: true, rowKey: true })
  .merge(z.object({ forwardRoomIds: selectRoomSchema.shape.id.array().min(1).max(MAX_READ_LIMIT) }));
export type ForwardMessagesInput = z.infer<typeof forwardMessagesInputSchema>;

export const messageRouter = router({
  createMessage: getRoomUserProcedure(createMessageInputSchema, "roomId")
    .use(getProfanityFilterMiddleware(createMessageInputSchema, ["message"]))
    .input(createMessageInputSchema)
    .mutation<MessageEntity>(async ({ ctx, input }) => {
      const newMessage = createMessageEntity({ ...input, userId: ctx.session.user.id });
      const messageClient = await useTableClient(AzureTable.Messages);
      await createEntity(messageClient, newMessage);
      messageEventEmitter.emit("createMessage", [newMessage]);
      return newMessage;
    }),
  createTyping: getRoomUserProcedure(createTypingInputSchema, "roomId")
    .input(createTypingInputSchema)
    // Query instead of mutation as there are no concurrency issues with ordering for simply emitting
    .query(({ input }) => {
      messageEventEmitter.emit("createTyping", input);
    }),
  deleteFile: getRoomUserProcedure(deleteFileInputSchema, "partitionKey")
    .input(deleteFileInputSchema)
    .mutation(async ({ ctx, input: { id, partitionKey, rowKey } }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      const message = await getEntity(messageClient, MessageEntity, partitionKey, rowKey);
      if (!message)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(AzureEntityType.Message, JSON.stringify({ partitionKey, rowKey })).message,
        });
      else if (message.userId !== ctx.session.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      else if (message.files.length === 0) return;

      const index = message.files.findIndex((f) => f.id === id);
      if (index === -1)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(AzureEntityType.Message, JSON.stringify({ partitionKey, rowKey })).message,
        });

      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      const blobName = getBlobName(ctx.roomId, id, message.files.splice(index, 1)[0].filename);
      const updatedMessage = {
        files: message.files,
        partitionKey,
        rowKey,
      } as const satisfies AzureUpdateEntity<MessageEntity>;
      await updateEntity(messageClient, updatedMessage);
      messageEventEmitter.emit("updateMessage", updatedMessage);
      await containerClient.deleteBlob(blobName);
    }),
  deleteMessage: getRoomUserProcedure(deleteMessageInputSchema, "partitionKey")
    .input(deleteMessageInputSchema)
    .mutation(async ({ ctx, input }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      const messageEntity = await getEntity(messageClient, MessageEntity, input.partitionKey, input.rowKey);
      if (!messageEntity)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(AzureEntityType.Message, JSON.stringify(input)).message,
        });
      else if (messageEntity.userId !== ctx.session.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      await deleteEntity(messageClient, input.partitionKey, input.rowKey);
      messageEventEmitter.emit("deleteMessage", input);

      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      await deleteFiles(containerClient, messageEntity.files);
    }),
  forwardMessages: getRoomUserProcedure(forwardMessagesInputSchema, "partitionKey")
    .input(forwardMessagesInputSchema)
    .mutation(async ({ ctx, input: { forwardRoomIds, message, partitionKey, rowKey } }) => {
      const foundUsersToRooms = await ctx.db.query.usersToRooms.findMany({
        where: (usersToRooms, { and, eq, inArray }) =>
          and(eq(usersToRooms.userId, ctx.session.user.id), inArray(usersToRooms.roomId, forwardRoomIds)),
      });
      if (foundUsersToRooms.length !== forwardRoomIds.length) throw new TRPCError({ code: "UNAUTHORIZED" });

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
        forwardRoomIds.map(async (forwardRoomId) => {
          const newFileIds = await cloneFiles(containerClient, messageEntity.files, forwardRoomId, ctx.roomId);
          const forward = createMessageEntity({
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            files: messageEntity.files.map((file, index) => new FileEntity({ ...file, id: newFileIds[index] })),
            isForward: true,
            message: messageEntity.message,
            // We don't forward reply information for privacy
            replyRowKey: undefined,
            roomId: forwardRoomId,
            userId: ctx.session.user.id,
          });
          const newMessageEntity = createMessageEntity({ message, roomId: forwardRoomId, userId: ctx.session.user.id });
          await createEntity(messageClient, forward);
          await createEntity(messageClient, newMessageEntity);
          // We don't need visual effects like isLoading when forwarding messages
          // so we'll instead rely on the subscription to auto-add the forwarded message for convenience
          messageEventEmitter.emit("createMessage", [forward, true], [newMessageEntity, true]);
        }),
      );
    }),
  generateDownloadFileSasUrls: getRoomUserProcedure(generateDownloadFileSasUrlsInputSchema, "roomId")
    .input(generateDownloadFileSasUrlsInputSchema)
    .query(async ({ input: { files, roomId } }) => {
      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      return generateDownloadFileSasUrls(containerClient, files, roomId);
    }),
  generateUploadFileSasUrls: getRoomUserProcedure(generateUploadFileSasUrlsInputSchema, "roomId")
    .input(generateUploadFileSasUrlsInputSchema)
    .query<FileSasEntity[]>(async ({ input: { files, roomId } }) => {
      const containerClient = await useContainerClient(AzureContainer.EsbabblerAssets);
      const fileSasEntities = await Promise.all(
        files.map<Promise<FileSasEntity>>(async ({ filename, mimetype }) => {
          const id: string = crypto.randomUUID();
          const blobName = getBlobName(roomId, id, filename);
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          return {
            id,
            sasUrl: await blockBlobClient.generateSasUrl({
              contentType: mimetype,
              expiresOn: dayjs().add(1, "hour").toDate(),
              permissions: ContainerSASPermissions.from({ write: true }),
            }),
          };
        }),
      );
      return fileSasEntities;
    }),
  onCreateMessage: getRoomUserProcedure(onCreateMessageInputSchema, "roomId")
    .input(onCreateMessageInputSchema)
    .subscription(async function* ({ ctx, input, signal }) {
      for await (const data of on(messageEventEmitter, "createMessage", { signal })) {
        const dataToYield: MessageEntity[] = [];

        for (const [newMessage, isIncludesSelf] of data)
          if (
            isMessagesPartitionKeyForRoomId(newMessage.partitionKey, input.roomId) &&
            (isIncludesSelf || newMessage.userId !== ctx.session.user.id)
          )
            dataToYield.push(newMessage);

        yield dataToYield;
      }
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
      const sortBy: SortItem<keyof MessageEntity>[] = [{ key: "rowKey", order: SortOrder.Asc }];
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
    .mutation(async ({ ctx, input }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      const message = await getEntity(messageClient, MessageEntity, input.partitionKey, input.rowKey);
      if (!message)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(messageRouter.forwardMessages.name, JSON.stringify(input)).message,
        });
      else if (message.userId !== ctx.session.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      await updateEntity(messageClient, input);
      messageEventEmitter.emit("updateMessage", input);
    }),
});
