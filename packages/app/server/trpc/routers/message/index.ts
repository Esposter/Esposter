import type {
  AzureUpdateEntity,
  Clause,
  FileSasEntity,
  MessageEntity,
  PushNotificationEventGridData,
} from "@esposter/db-schema";

import { createTypingInputSchema } from "#shared/models/db/message/CreateTypingInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MAX_READ_LIMIT, MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { useWebPubSubServiceClient } from "@@/server/composables/azure/webPubSub/useWebPubSubServiceClient";
import { getDeviceId } from "@@/server/services/auth/getDeviceId";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { roomEventEmitter } from "@@/server/services/message/events/roomEventEmitter";
import { isRoomId } from "@@/server/services/message/isRoomId";
import { readMessages } from "@@/server/services/message/readMessages";
import { searchMessages } from "@@/server/services/message/searchMessages";
import { updateMessage } from "@@/server/services/message/updateMessage";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getCreatorProcedure } from "@@/server/trpc/procedure/message/getCreatorProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import {
  cloneFiles,
  createMessage,
  deleteFiles,
  generateDownloadFileSasUrls,
  generateUploadFileSasEntities,
  getBlobName,
  getEntity,
  getTableNullClause,
  getTopNEntitiesByType,
  serializeClauses,
  updateEntity,
} from "@esposter/db";
import {
  AzureContainer,
  AzureEntityType,
  AzureFunction,
  AzureTable,
  AzureWebPubSubHub,
  BinaryOperator,
  DatabaseEntityType,
  FileEntity,
  fileEntitySchema,
  getReverseTickedTimestamp,
  MessageEntityMap,
  MessageType,
  rooms,
  selectRoomSchema,
  standardCreateMessageInputSchema,
  StandardMessageEntity,
  StandardMessageEntityPropertyNames,
  standardMessageEntitySchema,
} from "@esposter/db-schema";
import { InvalidOperationError, ItemMetadataPropertyNames, NotFoundError, Operation } from "@esposter/shared";
import { tracked, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const readMetadataInputSchema = z.object({
  messageRowKeys: standardMessageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
  roomId: selectRoomSchema.shape.id,
});
export type ReadMetadataInput = z.infer<typeof readMetadataInputSchema>;
// Azure table storage doesn't actually support sorting but remember that it is internally insert-sorted
// as we insert our messages with a reverse-ticked timestamp as our rowKey
// so unfortunately we have to provide a dummy default to keep the consistency here that cursor pagination
// always requires a sortBy even though we don't actually need the user to specify it
const readMessagesInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(standardMessageEntitySchema.keyof(), [
      { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
    ]).shape,
    filter: standardMessageEntitySchema.pick({ isPinned: true }).optional(),
    isIncludeValue: z.literal(true).optional(),
    order: z.literal(SortOrder.Asc).optional(),
    roomId: selectRoomSchema.shape.id,
  })
  .omit({ sortBy: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const readMessagesByRowKeysInputSchema = z.object({
  roomId: selectRoomSchema.shape.id,
  rowKeys: standardMessageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
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
  ...standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true }).shape,
  id: fileEntitySchema.shape.id,
});
export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;

const deleteLinkPreviewResponseInputSchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });
export type DeleteLinkPreviewResponseInput = z.infer<typeof deleteLinkPreviewResponseInputSchema>;

const onstandardCreateMessageInputSchema = z.object({
  lastEventId: z.string().nullish(),
  roomId: selectRoomSchema.shape.id,
});
export type OnCreateMessageInput = z.infer<typeof onstandardCreateMessageInputSchema>;

const onUpdateMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const onCreateTypingInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateTypingInput = z.infer<typeof onCreateTypingInputSchema>;

const onDeleteMessageInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

export const forwardMessageInputSchema = z.object({
  ...standardMessageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true }).shape,
  roomIds: selectRoomSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});
export type ForwardMessageInput = z.infer<typeof forwardMessageInputSchema>;

export const pinMessageInputSchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });
export type PinMessageInput = z.infer<typeof pinMessageInputSchema>;

export const unpinMessageInputSchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });
export type UnpinMessageInput = z.infer<typeof unpinMessageInputSchema>;

const getWebPubSubClientAccessUrlInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type GetWebPubSubClientAccessUrlInput = z.infer<typeof getWebPubSubClientAccessUrlInputSchema>;

export const messageRouter = router({
  createMessage: getMemberProcedure(standardCreateMessageInputSchema, "roomId").mutation<MessageEntity>(
    async ({ ctx, input }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
      const newMessageEntity = await createMessage(messageClient, messageAscendingClient, {
        ...input,
        userId: ctx.session.user.id,
      });
      messageEventEmitter.emit("createMessage", [[newMessageEntity], { sessionId: ctx.session.session.id }]);

      const eventGridPublisherClient = useEventGridPublisherClient();
      const data: PushNotificationEventGridData = {
        message: {
          message: newMessageEntity.message,
          partitionKey: newMessageEntity.partitionKey,
          rowKey: newMessageEntity.rowKey,
          userId: newMessageEntity.userId,
        },
        notificationOptions: { icon: ctx.session.user.image, title: ctx.session.user.name },
      };
      eventGridPublisherClient.send([
        {
          data,
          dataVersion: "1.0",
          eventType: AzureFunction.ProcessPushNotification,
          subject: `${newMessageEntity.partitionKey}/${newMessageEntity.rowKey}`,
        },
      ]);

      const updatedRoom = (
        await ctx.db.update(rooms).set({ updatedAt: new Date() }).where(eq(rooms.id, input.roomId)).returning()
      ).find(Boolean);
      if (!updatedRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Room, input.roomId).message,
        });

      roomEventEmitter.emit("updateRoom", updatedRoom);
      return newMessageEntity;
    },
  ),
  createTyping: getMemberProcedure(createTypingInputSchema, "roomId")
    // Query instead of mutation as there are no concurrency issues with ordering for simply emitting
    .query(({ ctx, input }) => {
      messageEventEmitter.emit("createTyping", { ...input, sessionId: ctx.session.session.id });
    }),
  deleteFile: getCreatorProcedure(deleteFileInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity }, input: { id, partitionKey, rowKey } }) => {
      if (messageEntity.isForward || messageEntity.files.length === 0) throw new TRPCError({ code: "BAD_REQUEST" });

      const index = messageEntity.files.findIndex((f) => f.id === id);
      if (index === -1)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(AzureEntityType.File, id).message,
        });

      const containerClient = await useContainerClient(AzureContainer.MessageAssets);
      const blobName = getBlobName(
        `${messageEntity.partitionKey}/${id}`,
        messageEntity.files.splice(index, 1)[0].filename,
      );
      const updatedMessageEntity: AzureUpdateEntity<StandardMessageEntity> = {
        files: messageEntity.files,
        partitionKey,
        rowKey,
      };
      await updateMessage(messageClient, updatedMessageEntity);
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);
      await containerClient.deleteBlob(blobName);
    },
  ),
  deleteLinkPreviewResponse: getCreatorProcedure(deleteLinkPreviewResponseInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity } }) => {
      const updatedMessageEntity: AzureUpdateEntity<StandardMessageEntity> = {
        linkPreviewResponse: null,
        partitionKey: messageEntity.partitionKey,
        rowKey: messageEntity.rowKey,
      };
      Object.assign(messageEntity, updatedMessageEntity);
      await updateMessage(messageClient, messageEntity, "Replace");
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);
    },
  ),
  deleteMessage: getCreatorProcedure(deleteMessageInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity }, input }) => {
      await updateMessage(messageClient, { ...input, deletedAt: new Date() });
      messageEventEmitter.emit("deleteMessage", input);

      const containerClient = await useContainerClient(AzureContainer.MessageAssets);
      await deleteFiles(containerClient, messageEntity.files);
    },
  ),
  forwardMessage: getMemberProcedure(forwardMessageInputSchema, "partitionKey").mutation(
    async ({ ctx, input: { message, partitionKey, roomIds, rowKey } }) => {
      await isMember(ctx.db, ctx.session, roomIds);

      const messageClient = await useTableClient(AzureTable.Messages);
      const messageEntity = await getEntity(messageClient, StandardMessageEntity, partitionKey, rowKey);
      if (!messageEntity)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(AzureEntityType.Message, JSON.stringify({ partitionKey, rowKey })).message,
        });

      const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
      const containerClient = await useContainerClient(AzureContainer.MessageAssets);
      await Promise.all(
        roomIds.map(async (roomId) => {
          const newFileIds = await cloneFiles(containerClient, messageEntity.files, messageEntity.partitionKey, roomId);
          const forward = await createMessage(messageClient, messageAscendingClient, {
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            files: messageEntity.files.map((file, index) => new FileEntity({ ...file, id: newFileIds[index] })),
            isForward: true,
            message: messageEntity.message,
            // We don't forward reply information for privacy
            replyRowKey: undefined,
            roomId,
            type: MessageType.Message,
            userId: ctx.session.user.id,
          });
          const messages = [forward];

          if (message) {
            const newMessageEntity = await createMessage(messageClient, messageAscendingClient, {
              message,
              roomId,
              type: MessageType.Message,
              userId: ctx.session.user.id,
            });
            messages.push(newMessageEntity);
          }
          // We don't need visual effects like isLoading when forwarding messages
          // so we'll instead rely on the subscription to auto-add the forwarded message for convenience
          messageEventEmitter.emit("createMessage", [
            messages,
            { isSendToSelf: true, sessionId: ctx.session.session.id },
          ]);
        }),
      );
    },
  ),
  generateDownloadFileSasUrls: getMemberProcedure(generateDownloadFileSasUrlsInputSchema, "roomId").query<string[]>(
    async ({ input: { files, roomId } }) => {
      const containerClient = await useContainerClient(AzureContainer.MessageAssets);
      return generateDownloadFileSasUrls(containerClient, files, roomId);
    },
  ),
  generateUploadFileSasEntities: getMemberProcedure(generateUploadFileSasEntitiesInputSchema, "roomId").query<
    FileSasEntity[]
  >(async ({ input: { files, roomId } }) => {
    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    return generateUploadFileSasEntities(containerClient, files, roomId);
  }),
  getWebPubSubClientAccessUrl: getMemberProcedure(getWebPubSubClientAccessUrlInputSchema, "roomId").query(
    async ({ ctx, input: { roomId }, signal }) => {
      const webPubSubServiceClient = useWebPubSubServiceClient(AzureWebPubSubHub.Messages);
      const { url } = await webPubSubServiceClient.getClientAccessToken({
        abortSignal: signal,
        groups: [roomId],
        roles: [`webPubSub.joinLeaveGroup.${roomId}`],
        userId: getDeviceId({ sessionId: ctx.session.session.id, userId: ctx.session.user.id }),
      });
      return url;
    },
  ),
  onCreateMessage: getMemberProcedure(onstandardCreateMessageInputSchema, "roomId").subscription(async function* ({
    ctx,
    input: { lastEventId, roomId },
    signal,
  }) {
    if (lastEventId) {
      let cursor: string | undefined = serialize({ rowKey: getReverseTickedTimestamp(lastEventId) }, [
        MESSAGE_ROWKEY_SORT_ITEM,
      ]);
      let hasMore = true;
      const messages: MessageEntity[] = [];

      while (hasMore) {
        const { hasMore: newHasMore, items, nextCursor } = await readMessages({ cursor, order: SortOrder.Asc, roomId });
        messages.push(...items);
        cursor = nextCursor;
        hasMore = newHasMore;
      }

      if (messages.length > 0) {
        // Remember that Azure Table Storage is insert-sorted by rowKey
        // so the first message is the newest one but we want to yield from oldest to newest
        const reversedMessages = messages.toReversed();
        const newestMessage = reversedMessages[reversedMessages.length - 1];
        yield tracked(newestMessage.rowKey, reversedMessages);
      }
    }

    for await (const [[data, { isSendToSelf, sessionId }]] of on(messageEventEmitter, "createMessage", { signal })) {
      const dataToYield: StandardMessageEntity[] = [];

      for (const newMessage of data)
        if (
          isRoomId(newMessage.partitionKey, roomId) &&
          (isSendToSelf || !getIsSameDevice({ sessionId, userId: newMessage.userId }, ctx.session))
        )
          dataToYield.push(newMessage);

      if (dataToYield.length > 0) {
        const newestMessage = dataToYield[dataToYield.length - 1];
        yield tracked(newestMessage.rowKey, dataToYield);
      }
    }
  }),
  onCreateTyping: getMemberProcedure(onCreateTypingInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [data] of on(messageEventEmitter, "createTyping", { signal }))
      if (data.roomId === input.roomId && !getIsSameDevice(data, ctx.session)) yield data;
  }),
  onDeleteMessage: getMemberProcedure(onDeleteMessageInputSchema, "roomId").subscription(async function* ({
    input,
    signal,
  }) {
    for await (const [data] of on(messageEventEmitter, "deleteMessage", { signal }))
      if (isRoomId(data.partitionKey, input.roomId)) yield data;
  }),
  onUpdateMessage: getMemberProcedure(onUpdateMessageInputSchema, "roomId").subscription(async function* ({
    input,
    signal,
  }) {
    for await (const [data] of on(messageEventEmitter, "updateMessage", { signal }))
      if (isRoomId(data.partitionKey, input.roomId)) yield data;
  }),
  pinMessage: getMemberProcedure(pinMessageInputSchema, "partitionKey").mutation(async ({ ctx, input }) => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const updatedMessageEntity: AzureUpdateEntity<MessageEntity> = { ...input, isPinned: true };
    await updateEntity(messageClient, updatedMessageEntity);
    messageEventEmitter.emit("updateMessage", updatedMessageEntity);

    const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
    const systemMessage = await createMessage(messageClient, messageAscendingClient, {
      replyRowKey: input.rowKey,
      roomId: input.partitionKey,
      type: MessageType.PinMessage,
      userId: ctx.session.user.id,
    });
    messageEventEmitter.emit("createMessage", [
      [systemMessage],
      { isSendToSelf: true, sessionId: ctx.session.session.id },
    ]);
  }),
  readMessages: getMemberProcedure(readMessagesInputSchema, "roomId").query(({ input }) => readMessages(input)),
  readMessagesByRowKeys: getMemberProcedure(readMessagesByRowKeysInputSchema, "roomId").query(
    async ({ input: { roomId, rowKeys } }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      const clauses: Clause[] = [
        { key: StandardMessageEntityPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
        getTableNullClause(ItemMetadataPropertyNames.deletedAt),
      ];
      for (const rowKey of rowKeys)
        clauses.push({
          key: StandardMessageEntityPropertyNames.rowKey,
          operator: BinaryOperator.eq,
          value: rowKey,
        });
      return getTopNEntitiesByType(messageClient, rowKeys.length, MessageEntityMap, {
        filter: serializeClauses(clauses),
      });
    },
  ),
  searchMessages: getMemberProcedure(searchMessagesInputSchema, "roomId").query(({ input }) => searchMessages(input)),
  unpinMessage: getMemberProcedure(unpinMessageInputSchema, "partitionKey").mutation(async ({ input }) => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const messageEntity = await getEntity(messageClient, StandardMessageEntity, input.partitionKey, input.rowKey);
    if (!messageEntity)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(AzureEntityType.Message, JSON.stringify(input)).message,
      });

    const updatedMessageEntity: AzureUpdateEntity<MessageEntity> = { ...input, isPinned: undefined };
    Object.assign(messageEntity, updatedMessageEntity);
    await updateEntity(messageClient, messageEntity, "Replace");
    messageEventEmitter.emit("updateMessage", updatedMessageEntity);
  }),
  updateMessage: getCreatorProcedure(updateMessageInputSchema).mutation(async ({ ctx: { messageClient }, input }) => {
    await updateMessage(messageClient, input);
    messageEventEmitter.emit("updateMessage", input);
  }),
});
