import type { ReadMySentMessagesResult } from "#shared/models/db/message/ReadMySentMessagesResult";
import type { SearchMessagesResult } from "#shared/models/db/message/SearchMessagesResult";
import type { MessageFileSasEntity } from "#shared/models/message/file/MessageFileSasEntity";
import type { ReadFollowedThreadsResult } from "#shared/models/message/thread/ReadFollowedThreadsResult";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { Clause } from "@esposter/azure";
import type { AzureUpdateEntity, MessageEntity } from "@esposter/db-schema";
import type { TrackedEnvelope } from "@trpc/server";

import { createTypingInputSchema } from "#shared/models/db/message/CreateTypingInput";
import { deleteFileInputSchema } from "#shared/models/db/message/DeleteFileInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { deleteUploadFilesInputSchema } from "#shared/models/db/message/DeleteUploadFilesInput";
import { followThreadInputSchema } from "#shared/models/db/message/FollowThreadInput";
import { forwardMessageInputSchema } from "#shared/models/db/message/ForwardMessageInput";
import { generateDownloadFileSasUrlsInputSchema } from "#shared/models/db/message/GenerateDownloadFileSasUrlsInput";
import { generateDownloadThumbnailSasUrlsInputSchema } from "#shared/models/db/message/GenerateDownloadThumbnailSasUrlsInput";
import { generateUploadFileSasEntitiesInputSchema } from "#shared/models/db/message/GenerateUploadFileSasEntitiesInput";
import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";
import { onCreateMessageInputSchema } from "#shared/models/db/message/OnCreateMessageInput";
import { readMessagesByRowKeysInputSchema } from "#shared/models/db/message/ReadMessagesByRowKeysInput";
import { readMessagesInputSchema } from "#shared/models/db/message/ReadMessagesInput";
import { readMySentMessagesInputSchema } from "#shared/models/db/message/ReadMySentMessagesInput";
import { readThreadInputSchema } from "#shared/models/db/message/ReadThreadInput";
import { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { votePollInputSchema } from "#shared/models/db/message/VotePollInput";
import { MessageOperation } from "#shared/models/message/MessageOperation";
import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { checkIsSameDevice } from "@@/server/services/auth/checkIsSameDevice";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { updateEntityConditionally } from "@@/server/services/azure/table/updateEntityConditionally";
import { generateWebPubSubClientAccessUrl } from "@@/server/services/azure/webPubSub/generateWebPubSubClientAccessUrl";
import { on } from "@@/server/services/events/on";
import { createSystemRoomMessage } from "@@/server/services/message/createSystemRoomMessage";
import { createUserMessage } from "@@/server/services/message/createUserMessage";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { checkIsUploadFileTokenValid } from "@@/server/services/message/file/checkIsUploadFileTokenValid";
import { createUploadFileToken } from "@@/server/services/message/file/createUploadFileToken";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { readMessages } from "@@/server/services/message/readMessages";
import { readMessagesByRowKeys } from "@@/server/services/message/readMessagesByRowKeys";
import { readMySentMessages } from "@@/server/services/message/readMySentMessages";
import { searchMessages } from "@@/server/services/message/searchMessages";
import { createThreadUnfollow } from "@@/server/services/message/thread/createThreadUnfollow";
import { readFollowedThreadRootRowKeys } from "@@/server/services/message/thread/readFollowedThreadRootRowKeys";
import { updateMessage } from "@@/server/services/message/updateMessage";
import { updateUserToRoom } from "@@/server/services/message/updateUserToRoom";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { assertIsMember } from "@@/server/trpc/middleware/userToRoom/assertIsMember";
import { getMessageProcedure } from "@@/server/trpc/procedure/message/getMessageProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getRoomEventSubscription } from "@@/server/trpc/procedure/room/getRoomEventSubscription";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { emojiRouter } from "@@/server/trpc/routers/message/emoji";
import { moderationRouter } from "@@/server/trpc/routers/message/moderation";
import { scheduledMessageJobRouter } from "@@/server/trpc/routers/message/scheduledMessageJob";
import { BinaryOperator, CompositeKeyPropertyNames, getTableNullClause, serializeClauses } from "@esposter/azure";
import {
  cloneFiles,
  createMessage,
  createThreadFollow,
  generateDownloadFileSasUrls,
  generateDownloadThumbnailSasUrls,
  generateUploadFileSasEntities,
  getEntity,
  getFileBlobNames,
  getFilesBlobNames,
  getTopNEntitiesByType,
  updateEntity,
} from "@esposter/db";
import {
  AzureContainer,
  AzureEntityType,
  AzureTable,
  AzureWebPubSubHub,
  DatabaseEntityType,
  FileEntity,
  FilterType,
  getMimeCategory,
  getReverseTickedTimestamp,
  MessageType,
  MessageTypeEntityMap,
  roomIdSchema,
  standardCreateMessageInputSchema,
  StandardMessageEntity,
  StandardMessageEntityPropertyNames,
} from "@esposter/db-schema";
import {
  getResult,
  ItemMetadataPropertyNames,
  jsonDateParse,
  MAX_READ_LIMIT,
  Operation,
  takeOne,
} from "@esposter/shared";
import { tracked, TRPCError } from "@trpc/server";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";

export const baseMessageRouter = router({
  createMessage: getMemberProcedure(standardCreateMessageInputSchema, "roomId").mutation<MessageEntity>(
    ({ ctx, input }) => createUserMessage(ctx.db, ctx.getSessionPayload, input),
  ),
  createTyping: getMemberProcedure(createTypingInputSchema, "roomId")
    // Query, not mutation: emitting has no ordering/concurrency concerns.
    .query<void>(({ ctx, input }) => {
      messageEventEmitter.emit("createTyping", [
        input,
        { sessionId: ctx.getSessionPayload.session.id, userId: input.userId },
      ]);
    }),
  // Removing one file rewrites the whole files array, so the write is conditional on the version the procedure
  // Read: two files deleted at once otherwise both compute the survivors from the same version, and the later
  // Write reinstates the file the earlier one removed — whose blob is already gone, leaving a message holding a
  // Broken attachment. The loser re-reads and drops its file from the survivors the winner stored
  deleteFile: getMessageProcedure(deleteFileInputSchema, MessageOperation.Update).mutation<void>(
    async ({ ctx: { messageClient, messageEntity, messageEtag }, input: { id, partitionKey, rowKey } }) => {
      if (messageEntity.isForward || messageEntity.files.length === 0)
        throw getInvalidOperationError(Operation.Delete, AzureEntityType.Message, id);
      // The blob names come from the version actually written, so a retry deletes the blobs of the file it
      // Removed from the survivors the winning write stored
      let deletedFilename = "";
      const updatedMessageEntity = await updateEntityConditionally(messageClient, StandardMessageEntity, {
        entityType: AzureEntityType.Message,
        entityWithEtag: { entity: messageEntity, etag: messageEtag },
        getUpdateEntity: ({ files }) => {
          const deletedFile = files.find((file) => file.id === id);
          if (!deletedFile) throw getNotFoundError(AzureEntityType.File, id);

          deletedFilename = deletedFile.filename;
          return { files: files.filter((file) => file.id !== id), partitionKey, rowKey };
        },
        writeEntity: (entity, etag) => updateMessage(messageClient, entity, undefined, { etag }),
      });
      messageEventEmitter.emit("updateMessage", [updatedMessageEntity]);
      // A dropped publish leaves an orphaned blob, never the file the user asked to remove
      await publishBlobDeletion(
        `${partitionKey}/${rowKey}`,
        AzureContainer.MessageAssets,
        Object.values(getFileBlobNames(partitionKey, id, deletedFilename)),
      );
    },
  ),
  // Clearing the preview needs a Replace — Merge cannot unset a property — so the write carries the whole message
  // Body and is conditional on the version the procedure read. Replaying the body this procedure first read would
  // Revert every concurrent change to the message, not only the preview it clears
  deleteLinkPreviewResponse: getMessageProcedure(messageCompositeKeySchema, MessageOperation.Update).mutation<void>(
    async ({ ctx: { messageClient, messageEntity, messageEtag } }) => {
      const { partitionKey, rowKey } = messageEntity;
      await updateEntityConditionally(messageClient, StandardMessageEntity, {
        entityType: AzureEntityType.Message,
        entityWithEtag: { entity: messageEntity, etag: messageEtag },
        // oxlint-disable-next-line typescript/no-misused-spread
        getUpdateEntity: (entity) => ({ ...entity, linkPreviewResponse: null }),
        writeEntity: (entity, etag) => updateMessage(messageClient, entity, "Replace", { etag }),
      });
      // The subscription carries the cleared field rather than the replaced body, so a client merges one property
      // Instead of adopting a whole message it may hold newer state for
      messageEventEmitter.emit("updateMessage", [{ linkPreviewResponse: null, partitionKey, rowKey }]);
    },
  ),
  deleteMessage: getMessageProcedure(deleteMessageInputSchema, MessageOperation.Delete).mutation<void>(
    async ({ ctx: { messageClient, messageEntity }, input }) => {
      await updateMessage(messageClient, { ...input, deletedAt: new Date() });
      messageEventEmitter.emit("deleteMessage", [input]);
      // A dropped publish leaves orphaned attachment blobs, never the delete the user asked for
      await publishBlobDeletion(
        `${messageEntity.partitionKey}/${messageEntity.rowKey}`,
        AzureContainer.MessageAssets,
        getFilesBlobNames(messageEntity.partitionKey, messageEntity.files),
      );
    },
  ),
  // Reclaims blobs that were uploaded against a write SAS but never reached a message — the composer's revert
  // Path. Nothing else can: every other deletion walks a persisted message entity's `files`, and an upload the
  // Composer threw away is referenced by no entity at all, so the bytes would sit in the container until the
  // Whole room is deleted. Membership cannot be the check: an unreferenced upload and a posted attachment share
  // One room-scoped namespace, and every member reads every attachment's id off the wire, so a name-only delete
  // Destroys anyone's posted attachment. The caller presents the grant it was handed when the SAS was minted
  deleteUploadFiles: getMemberProcedure(deleteUploadFilesInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { files, roomId } }) => {
      for (const { id, token } of files)
        if (!checkIsUploadFileTokenValid(ctx.getSessionPayload.user.id, roomId, id, token))
          throw new TRPCError({ code: "UNAUTHORIZED" });

      await publishBlobDeletion(roomId, AzureContainer.MessageAssets, getFilesBlobNames(roomId, files));
    },
  ),
  followThread: getMemberProcedure(followThreadInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { roomId, threadRootRowKey } }) => {
      // The bell is the member's own decision, so it clears any unfollow they recorded earlier
      await createThreadFollow(ctx.db, { roomId, threadRootRowKey, userId: ctx.getSessionPayload.user.id }, true);
    },
  ),
  forwardMessage: getMemberProcedure(forwardMessageInputSchema, CompositeKeyPropertyNames.partitionKey).mutation<void>(
    async ({ ctx, input: { message, partitionKey, roomIds, rowKey } }) => {
      await assertIsMember(ctx.db, ctx.getSessionPayload, roomIds);
      // Every client provisions its own table/container, so acquiring them together costs one round trip
      // Instead of three
      const [messageClient, messageAscendingClient, containerClient] = await Promise.all([
        useTableClient(AzureTable.Messages),
        useTableClient(AzureTable.MessagesAscending),
        useContainerClient(AzureContainer.MessageAssets),
      ]);
      const messageEntity = await requireEntity(
        getEntity(messageClient, StandardMessageEntity, partitionKey, rowKey),
        AzureEntityType.Message,
        JSON.stringify({ partitionKey, rowKey }),
      );
      // The filter has to see the text this forward WRITES. The forwarded body is what lands in the destination
      // Room, so checking only the accompanying note lets any filtered word through by forwarding it in from a
      // Room that does not filter it. Both texts go in one call because a single send attempt may spend at most
      // One automod consequence.
      const forwardedMessage = message ? `${messageEntity.message}\n${message}` : messageEntity.message;
      // Couple each room's word-filter check to its own creation attempt (single-send semantics per room): a
      // Room whose filter blocks times the sender out for THAT room only and posts nothing there, while every
      // Other room still receives the forward. allSettled lets the unblocked rooms finish writing before the
      // First per-room block is surfaced — never an all-rooms pre-flight that times out and then posts nothing.
      const results = await Promise.allSettled(
        roomIds.map(async (roomId) => {
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
            // Reply information is not forwarded, for privacy
            replyRowKey: undefined,
            roomId,
            type: MessageType.Message,
            userId: ctx.getSessionPayload.user.id,
          });
          const messages = [forward];

          if (message)
            messages.push(
              await createMessage(messageClient, messageAscendingClient, {
                message,
                roomId,
                type: MessageType.Message,
                userId: ctx.getSessionPayload.user.id,
              }),
            );
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
    async ({ input: { files, roomId } }) =>
      generateDownloadFileSasUrls(await useContainerClient(AzureContainer.MessageAssets), files, roomId),
  ),
  generateDownloadThumbnailSasUrls: getMemberProcedure(generateDownloadThumbnailSasUrlsInputSchema, "roomId").query<
    string[]
  >(async ({ input: { files, roomId } }) =>
    generateDownloadThumbnailSasUrls(await useContainerClient(AzureContainer.MessageAssets), files, roomId),
  ),
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
        throw getInvalidOperationError(Operation.Create, AzureEntityType.File, JSON.stringify({ mimetype, size }));
    // Room attachments are outside the personal storage quota, which counts what a user keeps in their own
    // Resources — a room's files belong to the room. See /docs/platform/storage-quotas
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
  generateWebPubSubClientAccessUrl: getMemberProcedure(roomIdSchema, "roomId").query<string>(
    ({ ctx, input: { roomId }, signal }) =>
      generateWebPubSubClientAccessUrl(AzureWebPubSubHub.Messages, roomId, ctx.getSessionPayload, signal),
  ),
  onCreateMessage: getMemberProcedure(onCreateMessageInputSchema, "roomId").subscription<
    AsyncGenerator<TrackedEnvelope<MessageEntity[]>, void, unknown>
  >(async function* ({ ctx, input: { lastEventId, roomId }, signal }) {
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

      if (messages.length > 0) yield tracked(takeOne(messages, messages.length - 1).rowKey, messages);
    }

    for await (const [[data, { isSendToSelf, sessionId }]] of createdMessages) {
      const dataToYield = data.filter(
        (newMessage) =>
          newMessage.partitionKey === roomId &&
          (isSendToSelf || !checkIsSameDevice({ sessionId, userId: newMessage.userId }, ctx.getSessionPayload)),
      );
      if (dataToYield.length > 0) yield tracked(takeOne(dataToYield, dataToYield.length - 1).rowKey, dataToYield);
    }
  }),
  onCreateTyping: getRoomEventSubscription(messageEventEmitter, "createTyping", ({ roomId }) => roomId),
  onDeleteMessage: getRoomEventSubscription(messageEventEmitter, "deleteMessage", ({ partitionKey }) => partitionKey),
  onUpdateMessage: getRoomEventSubscription(messageEventEmitter, "updateMessage", ({ partitionKey }) => partitionKey),
  pinMessage: getMessageProcedure(messageCompositeKeySchema, MessageOperation.Pin).mutation<void>(
    async ({ ctx: { getSessionPayload, messageClient }, input }) => {
      const updatedMessageEntity: AzureUpdateEntity<MessageEntity> = { ...input, isPinned: true };
      await updateEntity(messageClient, updatedMessageEntity);
      messageEventEmitter.emit("updateMessage", [updatedMessageEntity]);
      // The pin line is worded by the message it points at rather than by text of its own, and it is best-effort
      // Like every other system message — a failure leaves the pin in place without its line, never costs the pin
      await createSystemRoomMessage(input.partitionKey, getSessionPayload.user.id, "", getSessionPayload.session.id, {
        replyRowKey: input.rowKey,
        type: MessageType.PinMessage,
      });
    },
  ),
  // One read for both shapes the client needs, since the display list is derived from the follow state:
  // `threadRootRowKeys` is the follow-STATE source of truth — every followed root, including those whose root
  // Message was deleted, so the follow button can offer Unfollow on a thread whose root is gone but whose DB
  // Follow row remains — while `threads` drops deleted roots so the drawer never lists a dangling follow.
  readFollowedThreads: getMemberProcedure(roomIdSchema, "roomId").query<ReadFollowedThreadsResult>(
    async ({ ctx, input: { roomId } }) => {
      const threadRootRowKeys = await readFollowedThreadRootRowKeys(ctx.db, roomId, ctx.getSessionPayload.user.id);
      if (threadRootRowKeys.length === 0) return { threadRootRowKeys, threads: [] };
      // Every root in one scan, which also drops the deleted ones — so the drawer lists them newest-root-first
      // Rather than in the order the follows were recorded
      return { threadRootRowKeys, threads: await readMessagesByRowKeys(roomId, threadRootRowKeys) };
    },
  ),
  readMessages: getMemberProcedure(readMessagesInputSchema, "roomId").query<CursorPaginationData<MessageEntity>>(
    ({ input }) => readMessages(input),
  ),
  readMessagesByRowKeys: getMemberProcedure(readMessagesByRowKeysInputSchema, "roomId").query<MessageEntity[]>(
    ({ input: { roomId, rowKeys } }) => readMessagesByRowKeys(roomId, rowKeys),
  ),
  readMySentMessages: standardAuthedProcedure
    .input(readMySentMessagesInputSchema)
    .query<ReadMySentMessagesResult>(({ ctx, input }) =>
      readMySentMessages(input, ctx.db, ctx.getSessionPayload.user.id),
    ),
  readThread: getMemberProcedure(readThreadInputSchema, "roomId").query<MessageEntity[]>(
    async ({ input: { roomId, threadRootRowKey } }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      const replyClauses: Clause<StandardMessageEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
        { key: StandardMessageEntityPropertyNames.replyRowKey, operator: BinaryOperator.eq, value: threadRootRowKey },
        getTableNullClause(ItemMetadataPropertyNames.deletedAt),
      ];
      const [rootMessage, replies] = await Promise.all([
        getEntity(messageClient, StandardMessageEntity, roomId, threadRootRowKey),
        getTopNEntitiesByType(messageClient, MAX_READ_LIMIT, MessageTypeEntityMap, {
          filter: serializeClauses(replyClauses),
        }),
      ]);
      if (!rootMessage || rootMessage.deletedAt) return replies;
      return [rootMessage, ...replies];
    },
  ),
  searchMessages: getMemberProcedure(searchMessagesInputSchema, "roomId").query<SearchMessagesResult>(
    async ({ ctx, input }) => {
      const inFilterRoomIds = input.filters.filter(({ type }) => type === FilterType.In).map(({ value }) => value);
      if (!inFilterRoomIds.every((value) => typeof value === "string"))
        throw getInvalidOperationError(Operation.Read, AzureEntityType.Message, JSON.stringify(inFilterRoomIds));
      else if (inFilterRoomIds.length > 0) await assertIsMember(ctx.db, ctx.getSessionPayload, inFilterRoomIds);
      return searchMessages(input);
    },
  ),
  unfollowThread: getMemberProcedure(followThreadInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { roomId, threadRootRowKey } }) => {
      await createThreadUnfollow(ctx.db, { roomId, threadRootRowKey, userId: ctx.getSessionPayload.user.id });
    },
  ),
  // Unpinning needs a Replace — Merge cannot unset a property — so the same conditional write as
  // `deleteLinkPreviewResponse` applies: a full body replayed from a stale read reverts concurrent edits
  unpinMessage: getMessageProcedure(messageCompositeKeySchema, MessageOperation.Pin).mutation<void>(
    async ({ ctx: { messageClient, messageEntity, messageEtag }, input }) => {
      await updateEntityConditionally(messageClient, StandardMessageEntity, {
        entityType: AzureEntityType.Message,
        entityWithEtag: { entity: messageEntity, etag: messageEtag },
        // oxlint-disable-next-line typescript/no-misused-spread
        getUpdateEntity: (entity) => ({ ...entity, isPinned: undefined }),
        // A pin is not an edit of the message, so this writes through updateEntity rather than updateMessage
        writeEntity: (entity, etag) => updateEntity(messageClient, entity, "Replace", { etag }),
      });
      messageEventEmitter.emit("updateMessage", [{ ...input, isPinned: undefined }]);
    },
  ),
  updateMessage: getMessageProcedure(updateMessageInputSchema, MessageOperation.Update).mutation<void>(
    async ({ ctx: { messageClient }, input }) => {
      await updateMessage(messageClient, input);
      messageEventEmitter.emit("updateMessage", [input]);
    },
  ),
  // Casting a vote is not editing the poll: any member may vote, while editing or deleting the poll stays with
  // Its author. The client names the option it picked and the server applies it to the stored poll, so a member
  // Can never rewrite anyone else's vote by sending a whole poll body.
  //
  // A vote is a read-modify-write of the whole poll body, so the write is conditional on the version the
  // Procedure read: two members voting at once otherwise both compute their votes map from the same version and
  // The later write echoes back a body that never saw the earlier vote, erasing it with nothing surfaced to
  // Either voter. The loser of the race re-applies its vote to the version it re-reads, because the vote is
  // Still valid — only the body it was computed against is stale
  votePoll: getMessageProcedure(votePollInputSchema, MessageOperation.Vote).mutation<void>(
    async ({
      ctx: { getSessionPayload, messageClient, messageEntity, messageEtag },
      input: { optionId, partitionKey, rowKey },
    }) => {
      const votedMessageEntity = await updateEntityConditionally(messageClient, StandardMessageEntity, {
        entityType: AzureEntityType.Message,
        entityWithEtag: { entity: messageEntity, etag: messageEtag },
        // A vote is not an edit of the poll, so the client never sends the body — it names the option, and the
        // Server applies it to the stored poll. The whole poll is parsed and re-serialized through the one
        // Schema that owns its shape, the same one the renderer reads it back with: a second, narrower copy of
        // It here would strip every field it does not name — the option labels among them — off a poll that
        // Only ever passed through a vote
        getUpdateEntity: (pollMessageEntity) => {
          const pollContentResult = getResult(() => jsonDateParse<unknown>(pollMessageEntity.message))
            .map((pollContent) => pollMessageContentSchema.safeParse(pollContent))
            .unwrapOr(undefined);
          if (
            !pollContentResult?.success ||
            (optionId && !pollContentResult.data.options.some(({ id }) => id === optionId))
          )
            throw getInvalidOperationError(
              Operation.Update,
              AzureEntityType.Message,
              JSON.stringify({ optionId, partitionKey, rowKey }),
            );

          const pollContent = pollContentResult.data;
          if (optionId) pollContent.votes[getSessionPayload.user.id] = optionId;
          else delete pollContent.votes[getSessionPayload.user.id];
          return { message: JSON.stringify(pollContent), partitionKey, rowKey };
        },
        // The updateMessage service stamps the entity as edited, which a vote must not do
        writeEntity: (entity, etag) => updateEntity(messageClient, entity, "Merge", { etag }),
      });
      messageEventEmitter.emit("updateMessage", [votedMessageEntity]);
    },
  ),
});

export const messageRouter = mergeRouters(
  baseMessageRouter,
  router({ emoji: emojiRouter, moderation: moderationRouter, scheduledMessageJob: scheduledMessageJobRouter }),
);
