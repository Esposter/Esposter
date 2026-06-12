import type { AzureUpdateEntity, Clause, FileSasEntity, MessageEntity } from "@esposter/db-schema";

import { createTypingInputSchema } from "#shared/models/db/message/CreateTypingInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { readMySentMessagesInputSchema } from "#shared/models/db/message/ReadMySentMessagesInput";
import { readThreadInputSchema } from "#shared/models/db/message/ReadThreadInput";
import { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { DeletableMessageTypes } from "#shared/services/message/DeletableMessageTypes";
import { PinnableMessageTypes } from "#shared/services/message/PinnableMessageTypes";
import { UpdatableMessageTypes } from "#shared/services/message/UpdatableMessageTypes";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { useWebPubSubServiceClient } from "@@/server/composables/azure/webPubSub/useWebPubSubServiceClient";
import { getDeviceId } from "@@/server/services/auth/getDeviceId";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { createUserMessage } from "@@/server/services/message/createUserMessage";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { isRoomId } from "@@/server/services/message/isRoomId";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { readMessages } from "@@/server/services/message/readMessages";
import { readMySentMessages } from "@@/server/services/message/readMySentMessages";
import { searchMessages } from "@@/server/services/message/searchMessages";
import { updateMessage } from "@@/server/services/message/updateMessage";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMessageProcedure } from "@@/server/trpc/procedure/message/getMessageProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { emojiRouter } from "@@/server/trpc/routers/message/emoji";
import { moderationRouter } from "@@/server/trpc/routers/message/moderation";
import { scheduledMessageJobRouter } from "@@/server/trpc/routers/message/scheduledMessageJob";
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
  AzureTable,
  AzureWebPubSubHub,
  BinaryOperator,
  CompositeKeyPropertyNames,
  FileEntity,
  fileEntitySchema,
  FilterType,
  getReverseTickedTimestamp,
  MessageEntityMap,
  MessageType,
  roomIdSchema,
  selectRoomInMessageSchema,
  standardCreateMessageInputSchema,
  StandardMessageEntity,
  StandardMessageEntityPropertyNames,
  standardMessageEntitySchema,
} from "@esposter/db-schema";
import {
  InvalidOperationError,
  ItemMetadataPropertyNames,
  MAX_READ_LIMIT,
  NotFoundError,
  Operation,
  takeOne,
} from "@esposter/shared";
import { tracked, TRPCError } from "@trpc/server";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";
import { z } from "zod";
// Azure table storage doesn't actually support sorting but remember that it is internally insert-sorted
// As we insert our messages with a reverse-ticked timestamp as our rowKey
// So unfortunately we have to provide a dummy default to keep the consistency here that cursor pagination
// Always requires a sortBy even though we don't actually need the user to specify it
const readMessagesInputSchema = z
  .object({
    ...createCursorPaginationParamsSchema(standardMessageEntitySchema.keyof(), [
      { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
    ]).shape,
    filter: standardMessageEntitySchema.pick({ isPinned: true }).optional(),
    isIncludeValue: z.literal(true).optional(),
    order: z.literal(SortOrder.Asc).optional(),
    ...roomIdSchema.shape,
  })
  .omit({ sortBy: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const readMessagesByRowKeysInputSchema = z.object({
  ...roomIdSchema.shape,
  rowKeys: standardMessageEntitySchema.shape.rowKey.array().min(1).max(MAX_READ_LIMIT),
});
const generateUploadFileSasEntitiesInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});

const generateDownloadFileSasUrlsInputSchema = z.object({
  files: fileEntitySchema.pick({ filename: true, id: true, mimetype: true }).array().min(1).max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});

const deleteFileInputSchema = z.object({
  ...standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true }).shape,
  id: fileEntitySchema.shape.id,
});

const deleteLinkPreviewResponseInputSchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });

const onstandardCreateMessageInputSchema = z.object({
  lastEventId: z.string().nullish(),
  ...roomIdSchema.shape,
});

const onUpdateMessageInputSchema = roomIdSchema;

const onCreateTypingInputSchema = roomIdSchema;

const onDeleteMessageInputSchema = roomIdSchema;

export const forwardMessageInputSchema = z.object({
  ...standardMessageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true }).shape,
  roomIds: selectRoomInMessageSchema.shape.id.array().min(1).max(MAX_READ_LIMIT),
});

export const pinMessageInputSchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });

export const unpinMessageInputSchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });

const getWebPubSubClientAccessUrlInputSchema = roomIdSchema;

export const baseMessageRouter = router({
  createMessage: getMemberProcedure(standardCreateMessageInputSchema, "roomId").mutation<MessageEntity>(
    ({ ctx, input }) => createUserMessage(ctx.db, ctx.getSessionPayload, input),
  ),
  createTyping: getMemberProcedure(createTypingInputSchema, "roomId")
    // Query instead of mutation as there are no concurrency issues with ordering for simply emitting
    .query(({ ctx, input }) => {
      messageEventEmitter.emit("createTyping", { ...input, sessionId: ctx.getSessionPayload.session.id });
    }),
  deleteFile: getMessageProcedure(deleteFileInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity }, input: { id, partitionKey, rowKey } }) => {
      if (messageEntity.isForward || messageEntity.files.length === 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, AzureEntityType.Message, id).message,
        });

      const index = messageEntity.files.findIndex((f) => f.id === id);
      if (index === -1)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(AzureEntityType.File, id).message,
        });

      const containerClient = await useContainerClient(AzureContainer.MessageAssets);
      const blobName = getBlobName(
        `${messageEntity.partitionKey}/${id}`,
        takeOne(messageEntity.files.splice(index, 1)).filename,
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
  deleteLinkPreviewResponse: getMessageProcedure(deleteLinkPreviewResponseInputSchema).mutation(
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
  deleteMessage: getMessageProcedure(deleteMessageInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity }, input }) => {
      if (!DeletableMessageTypes.has(messageEntity.type))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Delete,
            AzureEntityType.Message,
            JSON.stringify({ partitionKey: messageEntity.partitionKey, rowKey: messageEntity.rowKey }),
          ).message,
        });
      await updateMessage(messageClient, { ...input, deletedAt: new Date() });
      messageEventEmitter.emit("deleteMessage", input);

      const containerClient = await useContainerClient(AzureContainer.MessageAssets);
      await deleteFiles(containerClient, messageEntity.files);
    },
  ),
  forwardMessage: getMemberProcedure(forwardMessageInputSchema, CompositeKeyPropertyNames.partitionKey).mutation(
    async ({ ctx, input: { message, partitionKey, roomIds, rowKey } }) => {
      await isMember(ctx.db, ctx.getSessionPayload, roomIds);
      const messageClient = await useTableClient(AzureTable.Messages);
      const messageEntity = await requireEntity(
        getEntity(messageClient, StandardMessageEntity, partitionKey, rowKey),
        AzureEntityType.Message,
        JSON.stringify({ partitionKey, rowKey }),
      );

      await Promise.all(
        roomIds.map((roomId) => assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, roomId, message)),
      );
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
            userId: ctx.getSessionPayload.user.id,
          });
          const messages = [forward];

          if (message) {
            const newMessageEntity = await createMessage(messageClient, messageAscendingClient, {
              message,
              roomId,
              type: MessageType.Message,
              userId: ctx.getSessionPayload.user.id,
            });
            messages.push(newMessageEntity);
          }
          // We don't need visual effects like isLoading when forwarding messages
          // So we'll instead rely on the subscription to auto-add the forwarded message for convenience
          messageEventEmitter.emit("createMessage", [
            messages,
            { isSendToSelf: true, sessionId: ctx.getSessionPayload.session.id },
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
        userId: getDeviceId({ sessionId: ctx.getSessionPayload.session.id, userId: ctx.getSessionPayload.user.id }),
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
      let cursor: string = serialize({ rowKey: getReverseTickedTimestamp(lastEventId) }, [MESSAGE_ROWKEY_SORT_ITEM]);
      let hasMore = true;
      const messages: MessageEntity[] = [];

      while (hasMore) {
        const { hasMore: newHasMore, items, nextCursor } = await readMessages({ cursor, order: SortOrder.Asc, roomId });
        messages.push(...items);
        cursor = nextCursor;
        hasMore = newHasMore;
      }

      if (messages.length > 0) {
        const newestMessage = takeOne(messages, messages.length - 1);
        yield tracked(newestMessage.rowKey, messages);
      }
    }

    for await (const [[data, { isSendToSelf, sessionId }]] of on(messageEventEmitter, "createMessage", { signal })) {
      const dataToYield: StandardMessageEntity[] = [];

      for (const newMessage of data)
        if (
          isRoomId(newMessage.partitionKey, roomId) &&
          (isSendToSelf || !getIsSameDevice({ sessionId, userId: newMessage.userId }, ctx.getSessionPayload))
        )
          dataToYield.push(newMessage);

      if (dataToYield.length > 0) {
        const newestMessage = takeOne(dataToYield, dataToYield.length - 1);
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
      if (data.roomId === input.roomId && !getIsSameDevice(data, ctx.getSessionPayload)) yield data;
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
  pinMessage: getMessageProcedure(pinMessageInputSchema).mutation(
    async ({ ctx: { getSessionPayload, messageClient, messageEntity }, input }) => {
      if (!PinnableMessageTypes.has(messageEntity.type))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Update,
            AzureEntityType.Message,
            JSON.stringify({ partitionKey: messageEntity.partitionKey, rowKey: messageEntity.rowKey }),
          ).message,
        });

      const updatedMessageEntity: AzureUpdateEntity<MessageEntity> = { ...input, isPinned: true };
      await updateEntity(messageClient, updatedMessageEntity);
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);

      const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
      const systemMessage = await createMessage(messageClient, messageAscendingClient, {
        replyRowKey: input.rowKey,
        roomId: input.partitionKey,
        type: MessageType.PinMessage,
        userId: getSessionPayload.user.id,
      });
      messageEventEmitter.emit("createMessage", [
        [systemMessage],
        { isSendToSelf: true, sessionId: getSessionPayload.session.id },
      ]);
    },
  ),
  readMessages: getMemberProcedure(readMessagesInputSchema, "roomId").query(({ input }) => readMessages(input)),
  readMessagesByRowKeys: getMemberProcedure(readMessagesByRowKeysInputSchema, "roomId").query(
    async ({ input: { roomId, rowKeys } }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      const clauses: Clause<StandardMessageEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
        getTableNullClause(ItemMetadataPropertyNames.deletedAt),
      ];
      for (const rowKey of rowKeys)
        clauses.push({
          key: CompositeKeyPropertyNames.rowKey,
          operator: BinaryOperator.eq,
          value: rowKey,
        });
      return getTopNEntitiesByType(messageClient, rowKeys.length, MessageEntityMap, {
        filter: serializeClauses(clauses),
      });
    },
  ),
  readMySentMessages: standardAuthedProcedure
    .input(readMySentMessagesInputSchema)
    .query(({ ctx, input }) => readMySentMessages(input, ctx.db, ctx.getSessionPayload.user.id)),
  readThread: getMemberProcedure(readThreadInputSchema, "roomId").query(async ({ input: { roomId, rootRowKey } }) => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const [rootMessage, replyClauses] = await Promise.all([
      getEntity(messageClient, StandardMessageEntity, roomId, rootRowKey),
      Promise.resolve([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
        { key: StandardMessageEntityPropertyNames.replyRowKey, operator: BinaryOperator.eq, value: rootRowKey },
        getTableNullClause(ItemMetadataPropertyNames.deletedAt),
      ] as Clause<StandardMessageEntity>[]),
    ]);
    const replies = await getTopNEntitiesByType(messageClient, MAX_READ_LIMIT, MessageEntityMap, {
      filter: serializeClauses(replyClauses),
    });
    if (rootMessage?.deletedAt) return replies;
    return rootMessage ? [rootMessage, ...replies] : replies;
  }),
  searchMessages: getMemberProcedure(searchMessagesInputSchema, "roomId").query(async ({ ctx, input }) => {
    const inFilterRoomIds = input.filters.filter(({ type }) => type === FilterType.In).map(({ value }) => value);
    if (inFilterRoomIds.some((value) => typeof value !== "string"))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Read, AzureEntityType.Message, JSON.stringify(inFilterRoomIds))
          .message,
      });
    else if (inFilterRoomIds.length > 0) await isMember(ctx.db, ctx.getSessionPayload, inFilterRoomIds as string[]);
    return searchMessages(input);
  }),
  unpinMessage: getMessageProcedure(unpinMessageInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity }, input }) => {
      if (!PinnableMessageTypes.has(messageEntity.type))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Update,
            AzureEntityType.Message,
            JSON.stringify({ partitionKey: messageEntity.partitionKey, rowKey: messageEntity.rowKey }),
          ).message,
        });

      const updatedMessageEntity: AzureUpdateEntity<MessageEntity> = { ...input, isPinned: undefined };
      Object.assign(messageEntity, updatedMessageEntity);
      await updateEntity(messageClient, messageEntity, "Replace");
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);
    },
  ),
  updateMessage: getMessageProcedure(updateMessageInputSchema).mutation(
    async ({ ctx: { messageClient, messageEntity }, input }) => {
      if (!UpdatableMessageTypes.has(messageEntity.type))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Update,
            AzureEntityType.Message,
            JSON.stringify({ partitionKey: messageEntity.partitionKey, rowKey: messageEntity.rowKey }),
          ).message,
        });
      await updateMessage(messageClient, input);
      messageEventEmitter.emit("updateMessage", input);
    },
  ),
});

export const messageRouter = mergeRouters(
  baseMessageRouter,
  router({ emoji: emojiRouter, moderation: moderationRouter, scheduledMessageJob: scheduledMessageJobRouter }),
);
