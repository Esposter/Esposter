import type { MessageFileSasEntity } from "#shared/models/message/file/MessageFileSasEntity";
import type { ReadFollowedThreadsOutput } from "#shared/models/message/thread/ReadFollowedThreadsOutput";
import type { AzureUpdateEntity, Clause, MessageEntity } from "@esposter/db-schema";

import { createTypingInputSchema } from "#shared/models/db/message/CreateTypingInput";
import { deleteFileInputSchema } from "#shared/models/db/message/DeleteFileInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { followThreadInputSchema } from "#shared/models/db/message/FollowThreadInput";
import { readMySentMessagesInputSchema } from "#shared/models/db/message/ReadMySentMessagesInput";
import { readThreadInputSchema } from "#shared/models/db/message/ReadThreadInput";
import { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { MessageOperation } from "#shared/models/message/MessageOperation";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { useWebPubSubServiceClient } from "@@/server/composables/azure/webPubSub/useWebPubSubServiceClient";
import { getDeviceId } from "@@/server/services/auth/getDeviceId";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { on } from "@@/server/services/events/on";
import { createUserMessage } from "@@/server/services/message/createUserMessage";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { createUploadFileToken } from "@@/server/services/message/file/createUploadFileToken";
import { getIsUploadFileTokenValid } from "@@/server/services/message/file/getIsUploadFileTokenValid";
import { isRoomId } from "@@/server/services/message/isRoomId";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { readMessages } from "@@/server/services/message/readMessages";
import { readMySentMessages } from "@@/server/services/message/readMySentMessages";
import { searchMessages } from "@@/server/services/message/searchMessages";
import { createThreadFollow } from "@@/server/services/message/thread/createThreadFollow";
import { readFollowedThreadRootRowKeys } from "@@/server/services/message/thread/readFollowedThreadRootRowKeys";
import { updateMessage } from "@@/server/services/message/updateMessage";
import { updateUserToRoom } from "@@/server/services/message/updateUserToRoom";
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
  generateDownloadFileSasUrls,
  generateDownloadThumbnailSasUrls,
  generateUploadFileSasEntities,
  getEntity,
  getEntityWithEtag,
  getFileBlobNames,
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
  DatabaseEntityType,
  FileEntity,
  fileEntitySchema,
  FilterType,
  getMimeCategory,
  getReverseTickedTimestamp,
  MessageEntityMap,
  MessageType,
  roomIdSchema,
  roomIdsSchema,
  standardCreateMessageInputSchema,
  StandardMessageEntity,
  StandardMessageEntityPropertyNames,
  standardMessageEntitySchema,
  threadFollowsInMessage,
} from "@esposter/db-schema";
import {
  createUniqueArraySchema,
  getResult,
  getResultAsync,
  InvalidOperationError,
  ItemMetadataPropertyNames,
  jsonDateParse,
  MAX_READ_LIMIT,
  noop,
  NotFoundError,
  Operation,
  takeOne,
} from "@esposter/shared";
import { tracked, TRPCError } from "@trpc/server";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
// Azure Table Storage has no real sorting; messages are insert-sorted via a reverse-ticked timestamp rowKey.
// We still pass a dummy default sortBy because cursor pagination always requires one.
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
  rowKeys: createUniqueArraySchema(standardMessageEntitySchema.shape.rowKey).min(1).max(MAX_READ_LIMIT),
});
const generateUploadFileSasEntitiesInputSchema = z.object({
  // Deliberately not a unique array: every write target is minted under its own fresh id (see getFileBlobNames),
  // So two files a user genuinely named the same collide nowhere, and rejecting the drop over the shared name
  // Would fail the whole selection for something the storage layout already keeps apart. The sibling delete and
  // Download schemas key on the id because by then the id exists; here the client has no id to send yet.
  files: fileEntitySchema.pick({ filename: true, mimetype: true, size: true }).array().min(1).max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});

const deleteUploadFilesInputSchema = z.object({
  files: createUniqueArraySchema(
    z.object({
      ...fileEntitySchema.pick({ filename: true, id: true }).shape,
      // The grant this member was handed when the write SAS was minted — see createUploadFileToken
      token: z.string().min(1),
    }),
    "id",
  )
    .min(1)
    .max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});

const generateDownloadThumbnailSasUrlsInputSchema = z.object({
  files: createUniqueArraySchema(fileEntitySchema.pick({ id: true }), "id")
    .min(1)
    .max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
});

const generateDownloadFileSasUrlsInputSchema = z.object({
  files: createUniqueArraySchema(fileEntitySchema.pick({ filename: true, id: true, mimetype: true }), "id")
    .min(1)
    .max(MAX_READ_LIMIT),
  ...roomIdSchema.shape,
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
  roomIds: roomIdsSchema.shape.roomIds.min(1),
});

export const pinMessageInputSchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });

export const unpinMessageInputSchema = standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true });

const votePollInputSchema = z.object({
  // "" withdraws the caller's vote — the radio group emits no selection rather than an option id
  optionId: z.union([z.literal(""), z.uuid()]),
  ...standardMessageEntitySchema.pick({ partitionKey: true, rowKey: true }).shape,
});

// Only the two fields a vote reads and writes, kept loose so the poll's question and any other authored field
// Survive the round trip untouched. A vote is not an edit of the poll, so the client never sends the body — it
// Names the option, and the server applies it to the stored poll.
const votablePollMessageContentSchema = z.looseObject({
  options: z.object({ id: z.string() }).array().min(1),
  votes: z.record(z.string(), z.string()),
});

// Bounded so a hot poll's concurrent votes cannot spin the mutation; on exhaustion the vote is refused rather
// Than dropped, so the voter is told to try again instead of watching their vote disappear
const MAX_VOTE_POLL_ETAG_RETRIES = 3;

const getWebPubSubClientAccessUrlInputSchema = roomIdSchema;

export const baseMessageRouter = router({
  createMessage: getMemberProcedure(standardCreateMessageInputSchema, "roomId").mutation<MessageEntity>(
    ({ ctx, input }) => createUserMessage(ctx.db, ctx.getSessionPayload, input),
  ),
  createTyping: getMemberProcedure(createTypingInputSchema, "roomId")
    // Query, not mutation: emitting has no ordering/concurrency concerns.
    .query(({ ctx, input }) => {
      messageEventEmitter.emit("createTyping", { ...input, sessionId: ctx.getSessionPayload.session.id });
    }),
  deleteFile: getMessageProcedure(deleteFileInputSchema, MessageOperation.Update).mutation(
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

      const blobNames = Object.values(
        getFileBlobNames(messageEntity.partitionKey, id, takeOne(messageEntity.files.splice(index, 1)).filename),
      );
      const updatedMessageEntity: AzureUpdateEntity<StandardMessageEntity> = {
        files: messageEntity.files,
        partitionKey,
        rowKey,
      };
      await updateMessage(messageClient, updatedMessageEntity);
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);
      // A dropped publish leaves an orphaned blob, never the file the user asked to remove
      await publishBlobDeletion(`${partitionKey}/${rowKey}`, AzureContainer.MessageAssets, blobNames);
    },
  ),
  deleteLinkPreviewResponse: getMessageProcedure(
    deleteLinkPreviewResponseInputSchema,
    MessageOperation.Update,
  ).mutation(async ({ ctx: { messageClient, messageEntity } }) => {
    const updatedMessageEntity: AzureUpdateEntity<StandardMessageEntity> = {
      linkPreviewResponse: null,
      partitionKey: messageEntity.partitionKey,
      rowKey: messageEntity.rowKey,
    };
    Object.assign(messageEntity, updatedMessageEntity);
    await updateMessage(messageClient, messageEntity, "Replace");
    messageEventEmitter.emit("updateMessage", updatedMessageEntity);
  }),
  deleteMessage: getMessageProcedure(deleteMessageInputSchema, MessageOperation.Delete).mutation(
    async ({ ctx: { messageClient, messageEntity }, input }) => {
      await updateMessage(messageClient, { ...input, deletedAt: new Date() });
      messageEventEmitter.emit("deleteMessage", input);
      // A dropped publish leaves orphaned attachment blobs, never the delete the user asked for
      await publishBlobDeletion(
        `${messageEntity.partitionKey}/${messageEntity.rowKey}`,
        AzureContainer.MessageAssets,
        messageEntity.files.flatMap(({ filename, id }) =>
          Object.values(getFileBlobNames(messageEntity.partitionKey, id, filename)),
        ),
      );
    },
  ),
  // Reclaims blobs that were uploaded against a write SAS but never reached a message — the composer's revert
  // Path. Nothing else can: every other deletion walks a persisted message entity's `files`, and an upload the
  // Composer threw away is referenced by no entity at all, so the bytes would sit in the container until the
  // Whole room is deleted. Membership cannot be the check: an unreferenced upload and a posted attachment share
  // One room-scoped namespace, and every member reads every attachment's id off the wire, so a name-only delete
  // Destroys anyone's posted attachment. The caller presents the grant it was handed when the SAS was minted
  deleteUploadFiles: getMemberProcedure(deleteUploadFilesInputSchema, "roomId").mutation(
    async ({ ctx, input: { files, roomId } }) => {
      for (const { id, token } of files)
        if (!getIsUploadFileTokenValid(ctx.getSessionPayload.user.id, roomId, id, token))
          throw new TRPCError({ code: "UNAUTHORIZED" });

      await publishBlobDeletion(
        roomId,
        AzureContainer.MessageAssets,
        files.flatMap(({ filename, id }) => Object.values(getFileBlobNames(roomId, id, filename))),
      );
    },
  ),
  followThread: getMemberProcedure(followThreadInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, threadRootRowKey } }) => {
      await createThreadFollow(ctx.db, { roomId, threadRootRowKey, userId: ctx.getSessionPayload.user.id });
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

      const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
      const containerClient = await useContainerClient(AzureContainer.MessageAssets);
      // Couple each room's word-filter check to its own creation attempt (single-send semantics per room): a
      // Room whose filter blocks times the sender out for THAT room only and posts nothing there, while every
      // Other room still receives the forward. allSettled lets the unblocked rooms finish writing before the
      // First per-room block is surfaced — never an all-rooms pre-flight that times out and then posts nothing.
      const results = await Promise.allSettled(
        roomIds.map(async (roomId) => {
          // The filter has to see the text this forward WRITES. The forwarded body is what lands in the
          // Destination room, so checking only the accompanying note lets any filtered word through by
          // Forwarding it in from a room that does not filter it. Both texts go in one call because a single
          // Send attempt may spend at most one automod consequence.
          const forwardedMessage = message ? `${messageEntity.message}\n${message}` : messageEntity.message;
          await assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, roomId, forwardedMessage);
          // A forward is a send like any other, so it advances the slowmode clock it was just checked against —
          // With the guards, before the write, so it can never fail open behind an already-persisted forward
          await updateUserToRoom(ctx.db, ctx.getSessionPayload.user.id, { lastMessageAt: new Date(), roomId });
          const clonedFiles = await cloneFiles(
            containerClient,
            messageEntity.files,
            messageEntity.partitionKey,
            roomId,
          );
          const forward = await createMessage(messageClient, messageAscendingClient, {
            files: messageEntity.files.map(
              // oxlint-disable-next-line typescript/no-misused-spread
              (file, index) => new FileEntity({ ...file, ...takeOne(clonedFiles, index) }),
            ),
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
          // Forwarding needs no isLoading effect, so let the subscription auto-add the message.
          messageEventEmitter.emit("createMessage", [
            messages,
            { isSendToSelf: true, sessionId: ctx.getSessionPayload.session.id },
          ]);
        }),
      );
      // Surface the first per-room block like a single blocked send does, after the unblocked rooms posted.
      // Only one rejection can be surfaced, so every rejection is logged with the room it belongs to first —
      // Otherwise a transient failure behind a blocked room leaves that room silently without the forward and
      // The operator with nothing to find.
      const rejections = results.flatMap((result, index) =>
        result.status === "rejected" ? [{ reason: result.reason, roomId: takeOne(roomIds, index) }] : [],
      );
      if (rejections.length === 0) return;

      for (const { reason, roomId } of rejections)
        console.error(`Failed to forward message to room ${roomId}:`, reason);
      throw takeOne(rejections).reason;
    },
  ),
  generateDownloadFileSasUrls: getMemberProcedure(generateDownloadFileSasUrlsInputSchema, "roomId").query<string[]>(
    async ({ input: { files, roomId } }) => {
      const containerClient = await useContainerClient(AzureContainer.MessageAssets);
      return generateDownloadFileSasUrls(containerClient, files, roomId);
    },
  ),
  generateDownloadThumbnailSasUrls: getMemberProcedure(generateDownloadThumbnailSasUrlsInputSchema, "roomId").query<
    string[]
  >(async ({ input: { files, roomId } }) => {
    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    return generateDownloadThumbnailSasUrls(containerClient, files, roomId);
  }),
  generateUploadFileSasEntities: getMemberProcedure(generateUploadFileSasEntitiesInputSchema, "roomId").query<
    MessageFileSasEntity[]
  >(async ({ ctx, input: { files, roomId } }) => {
    const room = await requireEntity(
      ctx.db.query.roomsInMessage.findFirst({
        columns: { allowedMimeCategories: true, maxFileSizeBytes: true },
        where: { id: { eq: roomId } },
      }),
      DatabaseEntityType.Room,
      roomId,
    );
    // The mime category is enforced here: it is signed into the write SAS as the blob's content type, so the PUT
    // Cannot store anything else. The size is NOT — `size` is whatever the client declared, an Azure write SAS
    // Carries no length constraint, and the block PUT never passes back through Nitro, so a client that
    // Under-declares can write past this cap until the SAS expires. Checking it here rejects the honest
    // Oversized drop early; it is not a defence against a client that lies. See /docs/esbabbler/file-media.
    const maxFileSizeBytes = Math.min(room.maxFileSizeBytes ?? MAX_FILE_REQUEST_SIZE, MAX_FILE_REQUEST_SIZE);
    for (const { mimetype, size } of files)
      if (size > maxFileSizeBytes || !room.allowedMimeCategories.includes(getMimeCategory(mimetype)))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, AzureEntityType.File, JSON.stringify({ mimetype, size }))
            .message,
        });

    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    const fileSasEntities = await generateUploadFileSasEntities(containerClient, files, roomId, {
      withThumbnail: true,
    });
    // The grant travels with the write target: whoever can upload the blob is the only one who can reclaim it
    return fileSasEntities.map((fileSasEntity) =>
      Object.assign(fileSasEntity, {
        token: createUploadFileToken(ctx.getSessionPayload.user.id, roomId, fileSasEntity.id),
      }),
    );
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
    // Listening starts BEFORE the catch-up, and the two overlap by design. `on` attaches its listener when it is
    // Called and queues what it receives until this loop consumes it, so a message committed while the catch-up
    // Is still paging is held rather than missed — the catch-up reads MessagesAscending, whose index row lands
    // Ahead of the entity every read serves (see createMessage), so a page can step past a message whose entity
    // Has not landed yet and never come back for it. Overlapping instead delivers such a message twice, which
    // The client's create handler already absorbs by id — the same guard reconnect catch-up needs anyway
    const createdMessages = on(messageEventEmitter, "createMessage", { signal });
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

    for await (const [[data, { isSendToSelf, sessionId }]] of createdMessages) {
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
  pinMessage: getMessageProcedure(pinMessageInputSchema, MessageOperation.Pin).mutation(
    async ({ ctx: { getSessionPayload, messageClient }, input }) => {
      const updatedMessageEntity: AzureUpdateEntity<MessageEntity> = { ...input, isPinned: true };
      await updateEntity(messageClient, updatedMessageEntity);
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);

      // Best-effort after the pin write — a failure leaves the pin in place without its system message, never
      // Costs the pin itself
      await getResultAsync(async () => {
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
      }).match(noop, console.error);
    },
  ),
  // One read for both shapes the client needs, since the display list is derived from the follow state:
  // `threadRootRowKeys` is the follow-STATE source of truth — every followed root, including those whose root
  // Message was deleted, so the follow button can offer Unfollow on a thread whose root is gone but whose DB
  // Follow row remains — while `threads` drops deleted roots so the drawer never lists a dangling follow.
  readFollowedThreads: getMemberProcedure(roomIdSchema, "roomId").query<ReadFollowedThreadsOutput>(
    async ({ ctx, input: { roomId } }) => {
      const threadRootRowKeys = await readFollowedThreadRootRowKeys(ctx.db, roomId, ctx.getSessionPayload.user.id);
      if (threadRootRowKeys.length === 0) return { threadRootRowKeys, threads: [] };

      const messageClient = await useTableClient(AzureTable.Messages);
      const rootMessages = await Promise.all(
        threadRootRowKeys.map((threadRootRowKey) =>
          getEntity(messageClient, StandardMessageEntity, roomId, threadRootRowKey),
        ),
      );
      return {
        threadRootRowKeys,
        threads: rootMessages.filter(
          (rootMessage): rootMessage is StandardMessageEntity => rootMessage !== null && !rootMessage.deletedAt,
        ),
      };
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
  unfollowThread: getMemberProcedure(followThreadInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, threadRootRowKey } }) => {
      await ctx.db
        .delete(threadFollowsInMessage)
        .where(
          and(
            eq(threadFollowsInMessage.userId, ctx.getSessionPayload.user.id),
            eq(threadFollowsInMessage.roomId, roomId),
            eq(threadFollowsInMessage.threadRootRowKey, threadRootRowKey),
          ),
        );
    },
  ),
  unpinMessage: getMessageProcedure(unpinMessageInputSchema, MessageOperation.Pin).mutation(
    async ({ ctx: { messageClient, messageEntity }, input }) => {
      const updatedMessageEntity: AzureUpdateEntity<MessageEntity> = { ...input, isPinned: undefined };
      Object.assign(messageEntity, updatedMessageEntity);
      await updateEntity(messageClient, messageEntity, "Replace");
      messageEventEmitter.emit("updateMessage", updatedMessageEntity);
    },
  ),
  updateMessage: getMessageProcedure(updateMessageInputSchema, MessageOperation.Update).mutation(
    async ({ ctx: { messageClient }, input }) => {
      await updateMessage(messageClient, input);
      messageEventEmitter.emit("updateMessage", input);
    },
  ),
  // Casting a vote is not editing the poll: any member may vote, while editing or deleting the poll stays with
  // Its author. The client names the option it picked and the server applies it to the stored poll, so a member
  // Can never rewrite anyone else's vote by sending a whole poll body.
  //
  // A vote is a read-modify-write of the whole poll body, so the write is conditional on the version the
  // Procedure read: two members voting at once otherwise both compute their votes map from the same version and
  // The later write echoes back a body that never saw the earlier vote, erasing it with nothing surfaced to
  // Either voter. The loser of the race re-reads and re-applies, because its vote is still valid — only the
  // Version it was computed against is stale. Retries are bounded, and a vote that still cannot land is refused
  // As a CONFLICT so the voter can send it again rather than believing a dropped vote counted.
  votePoll: getMessageProcedure(votePollInputSchema, MessageOperation.Vote).mutation(
    async ({
      ctx: { getSessionPayload, messageClient, messageEntity, messageEtag },
      input: { optionId, partitionKey, rowKey },
    }) => {
      // The version under vote travels as one value so each attempt destructures it into its own consts — the
      // Conditional write closes over them, and a closure over a variable the loop reassigns is exactly the bug
      // Optimistic concurrency exists to avoid
      let pollMessage = { entity: messageEntity, etag: messageEtag };
      let votedMessageEntity: AzureUpdateEntity<StandardMessageEntity> | undefined;

      for (let attempt = 0; attempt < MAX_VOTE_POLL_ETAG_RETRIES; attempt++) {
        const { entity: pollMessageEntity, etag } = pollMessage;
        const pollContentResult = getResult(() => jsonDateParse<unknown>(pollMessageEntity.message))
          .map((pollContent) => votablePollMessageContentSchema.safeParse(pollContent))
          .unwrapOr(undefined);
        if (
          !pollContentResult?.success ||
          (optionId && !pollContentResult.data.options.some(({ id }) => id === optionId))
        )
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              AzureEntityType.Message,
              JSON.stringify({ optionId, partitionKey, rowKey }),
            ).message,
          });

        const pollContent = pollContentResult.data;
        if (optionId) pollContent.votes[getSessionPayload.user.id] = optionId;
        else delete pollContent.votes[getSessionPayload.user.id];
        // The updateMessage service stamps the entity as edited, and a vote is not an edit of the poll
        const updatedMessageEntity: AzureUpdateEntity<StandardMessageEntity> = {
          message: JSON.stringify(pollContent),
          partitionKey,
          rowKey,
        };
        const updateError = await getResultAsync(() =>
          updateEntity(messageClient, updatedMessageEntity, "Merge", { etag }),
        ).match(
          () => undefined,
          (error) => error,
        );
        if (!updateError) {
          votedMessageEntity = updatedMessageEntity;
          break;
        }

        const rereadMessageEntity = await getEntityWithEtag(messageClient, StandardMessageEntity, partitionKey, rowKey);
        if (!rereadMessageEntity)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: new NotFoundError(AzureEntityType.Message, JSON.stringify({ partitionKey, rowKey })).message,
          });
        // Only a lost race is retried, and the re-read is what tells the two apart without a status code: a
        // Version that moved is the concurrent vote this write was rejected for, while an unchanged version
        // Means the write failed for a reason retrying cannot fix, so that error propagates as itself
        else if (rereadMessageEntity.etag === etag) throw updateError;

        pollMessage = rereadMessageEntity;
      }

      if (!votedMessageEntity) throw new TRPCError({ code: "CONFLICT" });

      messageEventEmitter.emit("updateMessage", votedMessageEntity);
    },
  ),
});

export const messageRouter = mergeRouters(
  baseMessageRouter,
  router({ emoji: emojiRouter, moderation: moderationRouter, scheduledMessageJob: scheduledMessageJobRouter }),
);
