import type { BasePaginationData } from "#shared/models/pagination/BasePaginationData";
import type { MessageFileSasEntity } from "#shared/models/message/file/MessageFileSasEntity";
import type { ReadFollowedThreadsResult } from "#shared/models/message/thread/ReadFollowedThreadsResult";
import type { ReadMySentMessagesResult } from "#shared/models/db/message/ReadMySentMessagesResult";
import type { SearchMessagesResult } from "#shared/models/db/message/SearchMessagesResult";
import type { RoomMessage } from "@esposter/db-schema";
import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { createUserMessage } from "#server/services/message/createUserMessage";
import { checkIsUploadFileTokenValid } from "#server/services/message/file/checkIsUploadFileTokenValid";
import { createUploadFileToken } from "#server/services/message/file/createUploadFileToken";
import { generateReservedMessageFileSasEntities } from "#server/services/message/file/generateReservedMessageFileSasEntities";
import { assertCanCreateMessage } from "#server/services/message/moderation/assertCanCreateMessage";
import { publishDeletedMessageFiles } from "#server/services/message/moderation/publishDeletedMessageFiles";
import { readMySentMessages } from "#server/services/message/readMySentMessages";
import { searchMessages } from "#server/services/message/searchMessages";
import { readFollowedThreadRootIds } from "#server/services/message/thread/readFollowedThreadRootIds";
import { upsertThreadUnfollow } from "#server/services/message/thread/upsertThreadUnfollow";
import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { getRoomEventOptions } from "#server/services/realtime/getRoomEventOptions";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { emitStorageUsage } from "#server/services/storage/emitStorageUsage";
import { getBucket } from "#server/services/storage/getBucket";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
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
import { generateDownloadFileSasUrlsInputSchema } from "#shared/models/db/message/GenerateDownloadFileSasUrlsInput";
import { generateDownloadThumbnailSasUrlsInputSchema } from "#shared/models/db/message/GenerateDownloadThumbnailSasUrlsInput";
import { generateUploadFileSasEntitiesInputSchema } from "#shared/models/db/message/GenerateUploadFileSasEntitiesInput";
import { pinMessageInputSchema } from "#shared/models/db/message/PinMessageInput";
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
import {
  DatabaseEntityType,
  FilterType,
  getMimeCategory,
  MessageType,
  roomIdSchema,
  StorageBucket,
} from "@esposter/db-schema";
import {
  cloneFiles,
  createThreadFollow,
  generateDownloadFileSasUrls,
  generateDownloadThumbnailSasUrls,
  getFileBlobNames,
  getFilesBlobNames,
  getMentionIds,
} from "@esposter/db";
import { getResultAsync, noop, Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";

export const baseMessageRouter = router({
  // The sender's time zone is the call's and never the message's, so it is dropped before the message is written
  createMessage: getMemberProcedure(zonedCreateMessageInputSchema, "roomId").mutation<RoomMessage>(
    ({ ctx, input: { timeZone: _timeZone, ...input } }) =>
      createUserMessage(ctx.db, getRoomActor(ctx.getSessionPayload, ctx.headers), input),
  ),
  // oxlint-disable-next-line trpc-procedure/require-query-verb -- typing earns no achievement, and a mutation runs the achievement plugin on every keystroke
  createTyping: getMemberProcedure(roomIdSchema, "roomId")
    // Query, not mutation: emitting has no ordering/concurrency concerns.
    .query<void>(async ({ ctx, input: { roomId } }) => {
      const { user } = ctx.getSessionPayload;
      // Who is typing, and the name the room knows them by, are the server's to say, never the input's: a member
      // Naming another would show them typing, and a member naming themselves could wear any name
      const userToRoom = await ctx.db.query.usersToRoomsInMessage.findFirst({
        columns: { displayName: true },
        where: { roomId: { eq: roomId }, userId: { eq: user.id } },
      });
      await useRoomObject(roomId).broadcastEvent(
        { data: { roomId, userId: user.id, username: userToRoom?.displayName || user.name }, type: "createTyping" },
        getRoomEventOptions(getRoomActor(ctx.getSessionPayload, ctx.headers)),
      );
    }),
  // Removing one file rewrites the whole files array inside the room's object, which applies the removal to the version
  // it holds and returns the file it removed, so the blob deleted is the one that version named
  deleteFile: getMessageProcedure(deleteFileInputSchema, MessageOperation.Update).mutation<void>(
    async ({ ctx, input: { fileId, id, roomId } }) => {
      if (ctx.message.isForward || ctx.message.files.length === 0)
        throw getInvalidOperationError(Operation.Delete, DatabaseEntityType.Message, JSON.stringify({ fileId, id }));

      const deletedFile = await useRoomObject(roomId).deleteFile(
        { fileId, id },
        getRoomActor(ctx.getSessionPayload, ctx.headers),
      );
      if (!deletedFile) throw getNotFoundError(DatabaseEntityType.File, fileId);
      // A dropped publish leaves an orphaned blob, never the file the user asked to remove
      await publishBlobDeletion(
        StorageBucket.MessageAssets,
        Object.values(getFileBlobNames(roomId, fileId, deletedFile.filename)),
      ).match(noop, console.error);
    },
  ),
  // Clearing the preview is the room object's write, which replaces the whole row's preview rather than merging a field
  deleteLinkPreviewResponse: getMessageProcedure(
    deleteLinkPreviewResponseInputSchema,
    MessageOperation.Update,
  ).mutation<void>(async ({ ctx, input }) => {
    await requireEntity(
      useRoomObject(input.roomId).deleteLinkPreview(input.id, getRoomActor(ctx.getSessionPayload, ctx.headers)),
      DatabaseEntityType.Message,
      JSON.stringify(input),
    );
  }),
  deleteMessage: getMessageProcedure(deleteMessageInputSchema, MessageOperation.Delete).mutation<void>(
    async ({ ctx, input }) => {
      // The object returns the message as it was before the delete, so the blobs its files named can be removed
      const deletedMessage = await requireEntity(
        useRoomObject(input.roomId).deleteMessage(input.id, getRoomActor(ctx.getSessionPayload, ctx.headers)),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      );
      await publishDeletedMessageFiles(input.roomId, [deletedMessage]);
    },
  ),
  // Reclaims blobs that were uploaded against a write SAS but never reached a message — the composer's revert
  // Path. Nothing else can: every other deletion walks a persisted message's `files`, and an upload the composer threw
  // Away is referenced by no message at all, so the bytes would sit in the bucket until the whole room is deleted.
  // Membership cannot be the check: an unreferenced upload and a posted attachment share one room-scoped namespace, and
  // every member reads every attachment's id off the wire, so a name-only delete destroys anyone's posted attachment.
  // The caller presents the grant it was handed when the SAS was minted
  deleteUploadFiles: getMemberProcedure(deleteUploadFilesInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { files, roomId } }) => {
      for (const { id, token } of files)
        if (!checkIsUploadFileTokenValid(ctx.getSessionPayload.user.id, roomId, id, token))
          throw new TRPCError({ code: "UNAUTHORIZED" });

      await publishBlobDeletion(StorageBucket.MessageAssets, getFilesBlobNames(roomId, files)).match(
        noop,
        console.error,
      );
    },
  ),
  followThread: getMemberProcedure(followThreadInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { roomId, threadRootId } }) => {
      // The bell is the member's own decision, so it clears any unfollow they recorded earlier
      await createThreadFollow(ctx.db, { roomId, threadRootId, userId: ctx.getSessionPayload.user.id }, true);
    },
  ),
  forwardMessage: getMemberProcedure(forwardMessageInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { id, message, roomId, roomIds } }) => {
      await assertIsMember(ctx.db, ctx.getSessionPayload, roomIds);
      const userId = ctx.getSessionPayload.user.id;
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
          await assertCanCreateMessage(ctx.db, userId, targetRoomId, forwardedMessage);
          // A forward is a send like any other, so it advances the slowmode clock it was just checked against —
          // With the guards, before the write, so it can never fail open behind an already-persisted forward
          const now = new Date();
          await updateUserToRoom(ctx.db, userId, { lastMessageAt: now, lastReadAt: now, roomId: targetRoomId });
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
          // actor names no device
          const actor = { userId };
          const roomObject = useRoomObject(targetRoomId);
          await roomObject.createMessage(
            {
              files: source.files.map((file, index) => ({ ...file, ...takeOne(clonedFiles, index) })),
              isForward: true,
              // Reply information is not forwarded, for privacy
              message: source.message,
              type: MessageType.Message,
            },
            actor,
          );
          if (message) await roomObject.createMessage({ message, type: MessageType.Message }, actor);
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
    },
  ),
  generateDownloadFileSasUrls: getMemberProcedure(generateDownloadFileSasUrlsInputSchema, "roomId").query<string[]>(
    ({ input: { files, roomId } }) =>
      generateDownloadFileSasUrls(getStorageCredentials(), StorageBucket.MessageAssets, files, roomId),
  ),
  generateDownloadThumbnailSasUrls: getMemberProcedure(generateDownloadThumbnailSasUrlsInputSchema, "roomId").query<
    string[]
  >(({ input: { files, roomId } }) =>
    generateDownloadThumbnailSasUrls(getStorageCredentials(), StorageBucket.MessageAssets, files, roomId),
  ),
  generateUploadFileSasEntities: getMemberProcedure(generateUploadFileSasEntitiesInputSchema, "roomId").mutation<
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
    // The mime category is checked here on the declared type only: the write SAS's content type is a response
    // Header override applied when the url is read, so it does not limit what the PUT stores. Nor does the size —
    // `size` is whatever the client declared, an upload SAS carries no length constraint, and the block PUT never
    // Passes back through Nitro, so a client that under-declares can write past this cap until the SAS expires.
    // Checking it here rejects the honest oversized drop early; it is not a defence against a client that lies. See
    // openspec/specs/esbabbler/file-media/design.md.
    const maxFileSizeBytes = Math.min(room.maxFileSizeBytes || MAX_FILE_REQUEST_SIZE, MAX_FILE_REQUEST_SIZE);
    for (const { mimetype, size } of files)
      if (size > maxFileSizeBytes || !room.allowedMimeCategories.includes(getMimeCategory(mimetype)))
        throw getInvalidOperationError(Operation.Create, DatabaseEntityType.File, JSON.stringify({ mimetype, size }));
    // A write target is minted only after its bytes are reserved against the uploader's allowance: the bytes belong to
    // Whoever sent them, wherever the room is. See openspec/specs/resource/storage-quotas/design.md
    const fileSasEntities = await generateReservedMessageFileSasEntities(
      ctx.db,
      ctx.getSessionPayload.user.id,
      roomId,
      files,
    );
    // The grant travels with the write target: whoever can upload the blob is the only one who can reclaim it
    return fileSasEntities.map((fileSasEntity) =>
      Object.assign(fileSasEntity, {
        token: createUploadFileToken(ctx.getSessionPayload.user.id, roomId, fileSasEntity.id),
      }),
    );
  }),
  pinMessage: getMessageProcedure(pinMessageInputSchema, MessageOperation.Pin).mutation<void>(
    async ({ ctx, input }) => {
      await requireEntity(
        useRoomObject(input.roomId).pinMessage(input.id, getRoomActor(ctx.getSessionPayload, ctx.headers)),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      );
      // The pin line is worded by the message it points at rather than by text of its own, and it is best-effort
      // Like every other system message — a failure leaves the pin in place without its line, never costs the pin
      await createSystemRoomMessage(input.roomId, ctx.getSessionPayload.user.id, "", {
        replyToId: input.id,
        type: MessageType.PinMessage,
      }).match(noop, console.error);
    },
  ),
  // One read for both shapes the client needs, since the display list is derived from the follow state:
  // `threadRootIds` is the follow-STATE source of truth — every followed root, including those whose root message was
  // deleted, so the follow button can offer Unfollow on a thread whose root is gone but whose follow row remains — while
  // `threads` drops deleted roots so the drawer never lists a dangling follow
  readFollowedThreads: getMemberProcedure(roomIdSchema, "roomId").query<ReadFollowedThreadsResult>(
    async ({ ctx, input: { roomId } }) => {
      const threadRootIds = await readFollowedThreadRootIds(ctx.db, roomId, ctx.getSessionPayload.user.id);
      if (threadRootIds.length === 0) return { threadRootIds, threads: [] };
      // The object returns the roots in the order asked, so they are asked newest first: a message id only grows within
      // its room, so the largest id is the newest root. The read drops the deleted ones
      const threads = await useRoomObject(roomId).readMessagesByIds(
        threadRootIds.toSorted((firstId, secondId) => secondId - firstId),
      );
      return { threadRootIds, threads };
    },
  ),
  readMessages: getMemberProcedure(readMessagesInputSchema, "roomId").query<BasePaginationData<RoomMessage>>(
    async ({ input: { before, filter, limit, roomId } }) =>
      getBasePaginationData(
        await useRoomObject(roomId).readMessages({ before, isPinned: filter?.isPinned, limit: limit + 1 }),
        limit,
      ),
  ),
  readMessagesByIds: getMemberProcedure(readMessagesByIdsInputSchema, "roomId").query<RoomMessage[]>(
    ({ input: { messageIds, roomId } }) => useRoomObject(roomId).readMessagesByIds(messageIds),
  ),
  readMySentMessages: standardAuthedProcedure
    .input(readMySentMessagesInputSchema)
    .query<ReadMySentMessagesResult>(({ ctx, input }) =>
      readMySentMessages(input, ctx.db, ctx.getSessionPayload.user.id),
    ),
  readThread: getMemberProcedure(readThreadInputSchema, "roomId").query<RoomMessage[]>(
    ({ input: { roomId, threadRootId } }) => useRoomObject(roomId).readThread(threadRootId),
  ),
  searchMessages: getMemberProcedure(searchMessagesInputSchema, "roomId").query<SearchMessagesResult>(
    async ({ ctx, input }) => {
      const inFilterRoomIds = input.filters.filter(({ type }) => type === FilterType.In).map(({ value }) => value);
      if (!inFilterRoomIds.every((value) => typeof value === "string"))
        throw getInvalidOperationError(Operation.Read, DatabaseEntityType.Message, JSON.stringify(inFilterRoomIds));
      else if (inFilterRoomIds.length > 0) await assertIsMember(ctx.db, ctx.getSessionPayload, inFilterRoomIds);
      return searchMessages(input);
    },
  ),
  unfollowThread: getMemberProcedure(unfollowThreadInputSchema, "roomId").mutation<void>(
    async ({ ctx, input: { roomId, threadRootId } }) => {
      await upsertThreadUnfollow(ctx.db, { roomId, threadRootId, userId: ctx.getSessionPayload.user.id });
    },
  ),
  unpinMessage: getMessageProcedure(unpinMessageInputSchema, MessageOperation.Pin).mutation<void>(
    async ({ ctx, input }) => {
      await requireEntity(
        useRoomObject(input.roomId).unpinMessage(input.id, getRoomActor(ctx.getSessionPayload, ctx.headers)),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      );
    },
  ),
  updateMessage: getMessageProcedure(updateMessageInputSchema, MessageOperation.Update).mutation<void>(
    async ({ ctx, input }) => {
      // The object stamps the message as edited and takes its mentions as the new text names them, which the procedure
      // reads off the text it was sent
      await requireEntity(
        useRoomObject(input.roomId).updateMessage(
          { id: input.id, mentions: getMentionIds(input.message), message: input.message },
          getRoomActor(ctx.getSessionPayload, ctx.headers),
        ),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      );
    },
  ),
  // Casting a vote is not editing the poll: any member may vote, while editing or deleting the poll stays with its
  // Author. The client names the option it picked and the object applies it to the stored poll, so a member can never
  // Rewrite anyone else's vote by sending a whole poll body. An empty option id withdraws the caller's vote
  votePoll: getMessageProcedure(votePollInputSchema, MessageOperation.Vote).mutation<void>(async ({ ctx, input }) => {
    const votedMessage = await useRoomObject(input.roomId).votePoll(
      { id: input.id, optionId: input.optionId || undefined },
      getRoomActor(ctx.getSessionPayload, ctx.headers),
    );
    if (!votedMessage)
      throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Message, JSON.stringify(input));
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
