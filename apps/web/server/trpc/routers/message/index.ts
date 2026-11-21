import type { ReadMySentMessagesResult } from "#shared/models/db/message/ReadMySentMessagesResult";
import type { SearchMessagesResult } from "#shared/models/db/message/SearchMessagesResult";
import type { MessageFilePresignedUrlEntity } from "#shared/models/message/file/MessageFilePresignedUrlEntity";
import type { ReadFollowedThreadsResult } from "#shared/models/message/thread/ReadFollowedThreadsResult";
import type { AnchoredPage, Page, PageCursor, RoomMessage, ThreadFollowInMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { addMentionCounts } from "#server/services/message/addMentionCounts";
import { MAX_FORWARD_ROOMS, MAX_SEARCH_ROOMS } from "#server/services/message/constants";
import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { createUserMessage } from "#server/services/message/createUserMessage";
import { checkIsUploadFileTokenValid } from "#server/services/message/file/checkIsUploadFileTokenValid";
import { createUploadFileToken } from "#server/services/message/file/createUploadFileToken";
import { generateReservedMessageFilePresignedUrlEntities } from "#server/services/message/file/generateReservedMessageFilePresignedUrlEntities";
import { getInFilterRoomIds } from "#server/services/message/getInFilterRoomIds";
import { publishDeletedMessageFiles } from "#server/services/message/moderation/publishDeletedMessageFiles";
import { rejectMessageCreation } from "#server/services/message/moderation/rejectMessageCreation";
import { readMySentMessages } from "#server/services/message/readMySentMessages";
import { searchMessages } from "#server/services/message/searchMessages";
import { takeBackMentionCounts } from "#server/services/message/takeBackMentionCounts";
import { readThreadFollows } from "#server/services/message/thread/readThreadFollows";
import { upsertThreadUnfollow } from "#server/services/message/thread/upsertThreadUnfollow";
import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { getRoomEventOptions } from "#server/services/realtime/getRoomEventOptions";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { emitStorageUsage } from "#server/services/storage/emitStorageUsage";
import { getBucket } from "#server/services/storage/getBucket";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { router } from "#server/trpc/index";
import { getMessageProcedure } from "#server/trpc/procedure/message/getMessageProcedure";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { emojiRouter } from "#server/trpc/routers/message/emoji";
import { moderationRouter } from "#server/trpc/routers/message/moderation";
import { scheduledMessageRouter } from "#server/trpc/routers/message/scheduledMessage";
import { scheduledMessageJobRouter } from "#server/trpc/routers/message/scheduledMessageJob";
import { deleteFileInputSchema } from "#shared/models/db/message/DeleteFileInput";
import { deleteLinkPreviewResponseInputSchema } from "#shared/models/db/message/DeleteLinkPreviewResponseInput";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { deleteUploadFilesInputSchema } from "#shared/models/db/message/DeleteUploadFilesInput";
import { followThreadInputSchema } from "#shared/models/db/message/FollowThreadInput";
import { forwardMessageInputSchema } from "#shared/models/db/message/ForwardMessageInput";
import { generateDownloadFilePresignedUrlsInputSchema } from "#shared/models/db/message/GenerateDownloadFilePresignedUrlsInput";
import { generateDownloadThumbnailPresignedUrlsInputSchema } from "#shared/models/db/message/GenerateDownloadThumbnailPresignedUrlsInput";
import { generateUploadFilePresignedUrlEntitiesInputSchema } from "#shared/models/db/message/GenerateUploadFilePresignedUrlEntitiesInput";
import { pinMessageInputSchema } from "#shared/models/db/message/PinMessageInput";
import { readMessagesAroundInputSchema } from "#shared/models/db/message/ReadMessagesAroundInput";
import { readMessagesByIdsInputSchema } from "#shared/models/db/message/ReadMessagesByIdsInput";
import { readMessagesInputSchema } from "#shared/models/db/message/ReadMessagesInput";
import { readMySentMessagesInputSchema } from "#shared/models/db/message/ReadMySentMessagesInput";
import { readThreadInputSchema } from "#shared/models/db/message/ReadThreadInput";
import { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import { unfollowThreadInputSchema } from "#shared/models/db/message/UnfollowThreadInput";
import { unpinMessageInputSchema } from "#shared/models/db/message/UnpinMessageInput";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { votePollInputSchema } from "#shared/models/db/message/VotePollInput";
import { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import { MessageOperation } from "#shared/models/message/MessageOperation";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { getResolvedDisplayName } from "#shared/services/room/getResolvedDisplayName";
import {
  claimMessageSendSlot,
  cloneFiles,
  createThreadFollow,
  generateDownloadFilePresignedUrls,
  generateDownloadThumbnailPresignedUrls,
  getFileBlobNames,
  getFilesBlobNames,
  toPage,
} from "@esposter/db";
import {
  DatabaseEntityType,
  getLiveMembershipRelationalWhere,
  getMimeCategory,
  MAX_FOLLOWED_THREADS,
  MessageType,
  ROOM_MESSAGE_PAGE_SORT,
  roomIdSchema,
  StorageBucket,
} from "@esposter/db-schema";
import { getResultAsync, noop, Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";

const baseMessageRouter = router({
  // The sender's time zone is the call's and never the message's, so it is dropped before the message is written
  createMessage: getMemberProcedure(zonedCreateMessageInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes the new message to its sockets as a typed event" })
    .mutation<RoomMessage>(({ ctx, input: { timeZone: _timeZone, ...input } }) =>
      createUserMessage(ctx.db, getRoomActor(ctx), input),
    ),
  // oxlint-disable-next-line trpc-procedure/require-query-verb -- typing earns no achievement, and a mutation runs the achievement plugin on every keystroke
  createTyping: getMemberProcedure(roomIdSchema, "roomId")
    .meta({ staticReason: "The room object pushes who is typing to its sockets as a typed event" })
    // Query, not mutation: emitting has no ordering/concurrency concerns.
    .query<void>(async ({ ctx, input: { roomId } }) => {
      const { user } = ctx;
      // Who is typing, and the name the room knows them by, are the server's to say, never the input's: a member
      // Naming another would show them typing, and a member naming themselves could wear any name
      const userToRoom = await ctx.db.query.usersToRoomsInMessage.findFirst({
        columns: { displayName: true },
        where: getLiveMembershipRelationalWhere(roomId, user.id),
      });
      await useRoomObject(roomId).broadcastEvent(
        {
          data: { roomId, userId: user.id, username: getResolvedDisplayName(userToRoom?.displayName, user.name) },
          type: "createTyping",
        },
        getRoomEventOptions(getRoomActor(ctx)),
      );
    }),
  // Removing one file rewrites the whole files array inside the room's object, which applies the removal to the version
  // It holds and returns the file it removed, so the blob deleted is the one that version named. The message it stored
  // Is the answer, since the object sends the change to every socket but this device's own
  deleteFile: getMessageProcedure(deleteFileInputSchema, MessageOperation.Update)
    .meta({ staticReason: "The room object pushes the message with the file removed to its sockets as a typed event" })
    .mutation<RoomMessage>(async ({ ctx, input: { fileId, id, roomId } }) => {
      if (ctx.message.isForward || ctx.message.files.length === 0)
        throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.Message, JSON.stringify({ fileId, id }));

      const removal = await useRoomObject(roomId).deleteFile({ fileId, id }, getRoomActor(ctx));
      if (!removal) throw getNotFoundError(DatabaseEntityType.File, fileId);
      // A dropped publish leaves an orphaned blob, never the file the user asked to remove
      await publishBlobDeletion(
        StorageBucket.MessageAssets,
        Object.values(getFileBlobNames(roomId, fileId, removal.deletedFile.filename)),
      ).match(noop, console.error);
      return removal.message;
    }),
  // Clearing the preview is the room object's write, which replaces the whole row's preview rather than merging a field
  deleteLinkPreviewResponse: getMessageProcedure(deleteLinkPreviewResponseInputSchema, MessageOperation.Update)
    .meta({
      staticReason: "The room object pushes the message with its preview cleared to its sockets as a typed event",
    })
    .mutation<RoomMessage>(async ({ ctx, input }) =>
      requireEntity(
        useRoomObject(input.roomId).deleteLinkPreview(input.id, getRoomActor(ctx)),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      ),
    ),
  deleteMessage: getMessageProcedure(deleteMessageInputSchema, MessageOperation.Delete)
    .meta({ staticReason: "The room object pushes the deletion to its sockets as a typed event" })
    .mutation<void>(async ({ ctx, input }) => {
      // The object returns the message as it was before the delete, so the blobs its files named can be removed
      const deletedMessage = await requireEntity(
        useRoomObject(input.roomId).deleteMessage(input.id, getRoomActor(ctx)),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      );
      await publishDeletedMessageFiles(input.roomId, [deletedMessage]);
      // Best-effort behind the delete, which the room object has already committed: a failed take-back costs a count,
      // Where rethrowing would reject a delete that landed
      await getResultAsync(() => takeBackMentionCounts(ctx.db, input.roomId, deletedMessage)).match(
        noop,
        console.error,
      );
    }),
  // Reclaims blobs that were uploaded against a presigned write url but never reached a message — the composer's revert
  // Path. Nothing else can: every other deletion walks a persisted message's `files`, and an upload the composer threw
  // Away is referenced by no message at all, so the bytes would sit in the bucket until the whole room is deleted.
  // Membership cannot be the check: an unreferenced upload and a posted attachment share one room-scoped namespace, and
  // Every member reads every attachment's id off the wire, so a name-only delete destroys anyone's posted attachment.
  // The caller presents the grant it was handed when the presigned url was minted
  deleteUploadFiles: getMemberProcedure(deleteUploadFilesInputSchema, "roomId")
    .meta({ staticReason: "It removes blobs no message names, so no reader shows what it deletes" })
    .mutation<void>(async ({ ctx, input: { files, roomId } }) => {
      for (const { id, token } of files)
        if (!checkIsUploadFileTokenValid(ctx.user.id, roomId, id, token)) throw new TRPCError({ code: "UNAUTHORIZED" });

      await publishBlobDeletion(StorageBucket.MessageAssets, getFilesBlobNames(roomId, files)).match(
        noop,
        console.error,
      );
    }),
  // The bell is the member's own decision, so it clears any unfollow they recorded earlier. Its row comes back with its version
  followThread: getMemberProcedure(followThreadInputSchema, "roomId").mutation<ThreadFollowInMessage>(
    async ({ ctx, input: { roomId, threadRootId } }) =>
      takeOne(await createThreadFollow(ctx.db, { roomId, threadRootId, userId: ctx.user.id }, true)),
  ),
  forwardMessage: getMemberProcedure(forwardMessageInputSchema, "roomId")
    .meta({ staticReason: "The room objects push the forwarded messages to their sockets as typed events" })
    .mutation<void>(async ({ ctx, input: { id, message, roomId, roomIds } }) => {
      if (roomIds.length > MAX_FORWARD_ROOMS)
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Message, JSON.stringify(roomIds.length));
      await assertIsMember(ctx, roomIds);
      const userId = ctx.user.id;
      const [source] = await useRoomObject(roomId).readMessagesByIds([id]);
      if (!source) throw getNotFoundError(DatabaseEntityType.Message, JSON.stringify({ id, roomId }));

      const bucket = getBucket(StorageBucket.MessageAssets);
      // The filter has to see the text this forward WRITES. The forwarded body is what lands in the destination
      // Room, so checking only the accompanying note lets any filtered word through by forwarding it in from a
      // Room that does not filter it. Both texts go in one call because a single send attempt may spend at most
      // One automod consequence.
      const forwardedMessage = message ? `${source.message}\n${message}` : source.message;
      // Couple each room's word-filter check to its own creation attempt (single-send semantics per room): a
      // Room whose filter blocks times the sender out for THAT room only and posts nothing there, while every
      // Other room still receives the forward. allSettled lets the unblocked rooms finish writing before the
      // First per-room block is surfaced — never an all-rooms pre-flight that times out and then posts nothing.
      const results = await Promise.allSettled(
        roomIds.map(async (targetRoomId) => {
          // A forward is a send like any other: it takes the slowmode claim a live send takes, with the guards, before the
          // Write, so it can never fail open behind an already-persisted forward
          await rejectMessageCreation(
            ctx.db,
            userId,
            targetRoomId,
            await claimMessageSendSlot(ctx.db, userId, targetRoomId, forwardedMessage, new Date()),
          );
          const clonedFiles = await cloneFiles(
            ctx.db,
            userId,
            StorageBucket.MessageAssets,
            bucket,
            source.files,
            roomId,
            targetRoomId,
          );
          // A forward is echoed to the tab that sent it as well, since it has no optimistic copy there to replace, so the
          // Actor names no device
          const actor = { userId };
          const roomObject = useRoomObject(targetRoomId);
          const forwardedRoomMessage = await roomObject.createMessage(
            {
              files: source.files.map((file, index) => ({ ...file, ...takeOne(clonedFiles, index) })),
              isForward: true,
              // Reply information is not forwarded, for privacy
              message: source.message,
              type: MessageType.Message,
            },
            actor,
          );
          const lastStoredMessage = message
            ? await roomObject.createMessage({ message, type: MessageType.Message }, actor)
            : forwardedRoomMessage;
          // The read clock is the time the room stored the last message, as a send stamps it
          await updateUserToRoom(ctx.db, userId, { lastReadAt: lastStoredMessage.createdAt, roomId: targetRoomId });
        }),
      );
      // Every copy that landed was charged to the forwarder, so the meter is read once the rooms have settled
      // The meter is best-effort: a failed read loses one usage update, never the forward the rooms already posted
      if (source.files.length > 0)
        await getResultAsync(() => emitStorageUsage(ctx.db, userId)).match(noop, console.error);
      // Surface the first per-room block like a single blocked send does, after the unblocked rooms posted.
      // Only one rejection can be surfaced, so every rejection is logged with the room it belongs to first —
      // Otherwise a transient failure behind a blocked room leaves that room silently without the forward and
      // The operator with nothing to find.
      const rejections = results.flatMap((result, index) =>
        result.status === "rejected" ? [{ reason: result.reason, roomId: takeOne(roomIds, index) }] : [],
      );
      if (rejections.length === 0) return;

      for (const { reason, roomId: rejectedRoomId } of rejections)
        console.error(`Failed to forward message to room ${rejectedRoomId}:`, reason);
      throw takeOne(rejections).reason;
    }),
  generateDownloadFilePresignedUrls: getMemberProcedure(generateDownloadFilePresignedUrlsInputSchema, "roomId")
    .meta({ staticReason: "A presigned download url, which no other reader shows" })
    .query<string[]>(({ input: { files, roomId } }) =>
      generateDownloadFilePresignedUrls(getStorageCredentials(), StorageBucket.MessageAssets, files, roomId),
    ),
  generateDownloadThumbnailPresignedUrls: getMemberProcedure(
    generateDownloadThumbnailPresignedUrlsInputSchema,
    "roomId",
  )
    .meta({ staticReason: "A presigned download url, which no other reader shows" })
    .query<string[]>(({ input: { files, roomId } }) =>
      generateDownloadThumbnailPresignedUrls(getStorageCredentials(), StorageBucket.MessageAssets, files, roomId),
    ),
  generateUploadFilePresignedUrlEntities: getMemberProcedure(
    generateUploadFilePresignedUrlEntitiesInputSchema,
    "roomId",
  )
    .meta({ staticReason: "A presigned upload target and its grant, which no other reader shows" })
    .mutation<MessageFilePresignedUrlEntity[]>(async ({ ctx, input: { files, roomId } }) => {
      const room = await requireEntity(
        ctx.db.query.roomsInMessage.findFirst({
          columns: { allowedMimeCategories: true, maxFileSizeBytes: true },
          where: { id: { eq: roomId } },
        }),
        DatabaseEntityType.Room,
        roomId,
      );
      // The mime category is checked here on the declared type only: the presigned write url's content type is a response
      // Header override applied when the url is read, so it does not limit what the PUT stores. Nor does the size —
      // `size` is whatever the client declared, an upload presigned url carries no length constraint, and the block PUT never
      // Passes back through Nitro, so a client that under-declares can write past this cap until the presigned url expires.
      // Checking it here rejects the honest oversized drop early; it is not a defence against a client that lies.
      // See openspec/specs/esbabbler/file-media/design.md.
      const maxFileSizeBytes = Math.min(room.maxFileSizeBytes || MAX_FILE_REQUEST_SIZE, MAX_FILE_REQUEST_SIZE);
      for (const { mimetype, size } of files)
        if (size > maxFileSizeBytes || !room.allowedMimeCategories.includes(getMimeCategory(mimetype)))
          throw getInvalidOperationError(Operation.Create, DatabaseEntityType.File, JSON.stringify({ mimetype, size }));
      // A write target is minted only after its bytes are reserved against the uploader's allowance: the bytes belong to
      // Whoever sent them, wherever the room is. See openspec/specs/resource/storage-quotas/design.md
      const filePresignedUrlEntities = await generateReservedMessageFilePresignedUrlEntities(
        ctx.db,
        ctx.user.id,
        roomId,
        files,
      );
      // The grant travels with the write target: whoever can upload the blob is the only one who can reclaim it
      return filePresignedUrlEntities.map((filePresignedUrlEntity) =>
        Object.assign(filePresignedUrlEntity, {
          token: createUploadFileToken(ctx.user.id, roomId, filePresignedUrlEntity.id),
        }),
      );
    }),
  // The pinned message as the object now stores it is the answer, since the object sends the pin to every socket
  // Except this device's own
  pinMessage: getMessageProcedure(pinMessageInputSchema, MessageOperation.Pin)
    .meta({ staticReason: "The room object pushes the pin to its sockets as a typed event" })
    .mutation<RoomMessage>(async ({ ctx, input }) => {
      const pinnedMessage = await requireEntity(
        useRoomObject(input.roomId).pinMessage(input.id, getRoomActor(ctx)),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      );
      // The pin line is worded by the message it points at rather than by text of its own, and it is best-effort
      // Like every other system message — a failure leaves the pin in place without its line, never costs the pin
      await createSystemRoomMessage(input.roomId, ctx.user.id, "", {
        replyToId: input.id,
        type: MessageType.PinMessage,
      }).match(noop, console.error);
      return pinnedMessage;
    }),
  // One read for both shapes the client needs: `follows` is the follow state, every row the member holds in the room, with the
  // Unfollowed ones kept as rows so a read cannot list a thread the member has since left. `threads` is the drawer's roots, for
  // The live follows only, and drops deleted roots so the drawer never lists a dangling follow
  readFollowedThreads: getMemberProcedure(roomIdSchema, "roomId").query<ReadFollowedThreadsResult>(
    async ({ ctx, input: { roomId } }) => {
      const follows = await readThreadFollows(ctx.db, roomId, ctx.user.id);
      const threadRootIds = follows.filter(({ isUnfollowed }) => !isUnfollowed).map(({ threadRootId }) => threadRootId);
      if (threadRootIds.length === 0) return { follows, threads: [] };
      // The follows come back newest root first, so the object's roots do too. The drawer lists the newest of them
      const threads = await useRoomObject(roomId).readThreads(threadRootIds.slice(0, MAX_FOLLOWED_THREADS));
      return { follows, threads };
    },
  ),
  readMessages: getMemberProcedure(readMessagesInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes its messages to its sockets as typed events" })
    .query<Page<RoomMessage>>(async ({ input: { cursor, filter, limit, roomId } }) =>
      toPage(
        await useRoomObject(roomId).readMessages({ cursor, isPinned: filter?.isPinned, limit: limit + 1 }),
        ROOM_MESSAGE_PAGE_SORT,
        cursor,
        limit,
      ),
    ),
  // A room opened at one of its messages: the message and the messages around it, read both ways from it. The older side
  // Starts at the anchor itself, so the anchor is the first of it, and the newer side starts just past it
  readMessagesAround: getMemberProcedure(readMessagesAroundInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes its messages to its sockets as typed events" })
    .query<AnchoredPage<RoomMessage>>(async ({ input: { limit, messageId, roomId } }) => {
      const roomObject = useRoomObject(roomId);
      const olderCursor: PageCursor = { isBackward: false, values: [messageId + 1] };
      const newerCursor: PageCursor = { isBackward: true, values: [messageId] };
      const [older, newer] = await Promise.all([
        roomObject.readMessages({ cursor: olderCursor, limit: limit + 1 }),
        roomObject.readMessages({ cursor: newerCursor, limit: limit + 1 }),
      ]);
      const olderPage = toPage(older, ROOM_MESSAGE_PAGE_SORT, olderCursor, limit);
      const newerPage = toPage(newer, ROOM_MESSAGE_PAGE_SORT, newerCursor, limit);
      return {
        items: [...newerPage.items, ...olderPage.items],
        nextCursor: olderPage.nextCursor,
        previousCursor: newerPage.nextCursor,
      };
    }),
  readMessagesByIds: getMemberProcedure(readMessagesByIdsInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes its messages to its sockets as typed events" })
    .query<RoomMessage[]>(({ input: { messageIds, roomId } }) => useRoomObject(roomId).readMessagesByIds(messageIds)),
  readMySentMessages: standardAuthedProcedure
    .input(readMySentMessagesInputSchema)
    .meta({
      staticReason:
        "Each message is read from its room's object, which pushes message changes to its sockets as typed events",
    })
    .query<ReadMySentMessagesResult>(({ ctx, input }) => readMySentMessages(input, ctx.db, ctx.user.id)),
  readThread: getMemberProcedure(readThreadInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes the thread's messages to its sockets as typed events" })
    .query<RoomMessage[]>(({ input: { roomId, threadRootId } }) => useRoomObject(roomId).readThread(threadRootId)),
  searchMessages: getMemberProcedure(searchMessagesInputSchema, "roomId")
    .meta({ staticReason: "A search answered once for its input, and never kept live" })
    .query<SearchMessagesResult>(async ({ ctx, input }) => {
      // The schema names every `in:` value a room id, so the rooms a search reads are bounded here and checked for membership
      const inFilterRoomIds = getInFilterRoomIds(input.filters);
      if (inFilterRoomIds.length > MAX_SEARCH_ROOMS)
        throw getInvalidOperationError(
          Operation.Read,
          DatabaseEntityType.Message,
          JSON.stringify(inFilterRoomIds.length),
        );
      if (inFilterRoomIds.length > 0) await assertIsMember(ctx, inFilterRoomIds);
      return searchMessages(input);
    }),
  unfollowThread: getMemberProcedure(unfollowThreadInputSchema, "roomId").mutation<ThreadFollowInMessage>(
    async ({ ctx, input: { roomId, threadRootId } }) =>
      takeOne(await upsertThreadUnfollow(ctx.db, { roomId, threadRootId, userId: ctx.user.id })),
  ),
  unpinMessage: getMessageProcedure(unpinMessageInputSchema, MessageOperation.Pin)
    .meta({ staticReason: "The room object pushes the unpin to its sockets as a typed event" })
    .mutation<RoomMessage>(async ({ ctx, input }) =>
      requireEntity(
        useRoomObject(input.roomId).unpinMessage(input.id, getRoomActor(ctx)),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      ),
    ),
  updateMessage: getMessageProcedure(updateMessageInputSchema, MessageOperation.Update)
    .meta({ staticReason: "The room object pushes the edited message to its sockets as a typed event" })
    .mutation<RoomMessage>(async ({ ctx, input }) => {
      // The object stamps the message as edited and names the members its new text names. It answers the message as it
      // Stood inside that write, so the mention counts its old text made are taken back, and the message it stores is the
      // Answer, since the object sends the edit to every socket but this device's own
      const { message: updatedMessage, previousMessage } = await requireEntity(
        useRoomObject(input.roomId).updateMessage({ id: input.id, message: input.message }, getRoomActor(ctx)),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      );
      // Best-effort behind the edit, which the room object has already committed: a failed count costs a badge, where
      // Rethrowing would reject an edit that landed
      await getResultAsync(() => takeBackMentionCounts(ctx.db, input.roomId, previousMessage)).match(
        noop,
        console.error,
      );
      await getResultAsync(() =>
        addMentionCounts(ctx.db, input.roomId, { message: input.message, userId: previousMessage.userId }),
      ).match(noop, console.error);
      return updatedMessage;
    }),
  // Casting a vote is not editing the poll: any member may vote, while editing or deleting the poll stays with its
  // Author. The client names the option it picked and the object applies it to the stored poll, so a member can never
  // Rewrite anyone else's vote by sending a whole poll body. An empty option id withdraws the caller's vote. The poll
  // As the object now stores it is the answer, since the object sends the vote to every socket but this device's own
  votePoll: getMessageProcedure(votePollInputSchema, MessageOperation.Vote)
    .meta({ staticReason: "The room object pushes the poll with the vote to its sockets as a typed event" })
    .mutation<RoomMessage>(async ({ ctx, input }) => {
      const votedMessage = await useRoomObject(input.roomId).votePoll(
        { id: input.id, optionId: input.optionId || undefined },
        getRoomActor(ctx),
      );
      if (!votedMessage)
        throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Message, JSON.stringify(input));

      return votedMessage;
    }),
});

export const messageRouter = mergeRouters(
  baseMessageRouter,
  router({
    emoji: emojiRouter,
    moderation: moderationRouter,
    scheduledMessage: scheduledMessageRouter,
    scheduledMessageJob: scheduledMessageJobRouter,
  }),
);
