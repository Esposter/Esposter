import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { getDevice } from "#server/services/auth/getDevice";
import { publishBlobDeletion } from "#server/services/queue/publishBlobDeletion";
import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { inRoom } from "#server/services/db/inRoom";
import { checkIsUnicodeEmojiSlug } from "#server/services/message/emoji/checkIsUnicodeEmojiSlug";
import { getRoomEmojiNameQuery } from "#server/services/message/emoji/getRoomEmojiNameQuery";
import { getRoomEmojiWithSasUrl } from "#server/services/message/emoji/getRoomEmojiWithSasUrl";
import { readRoomEmojiCount } from "#server/services/message/emoji/readRoomEmojiCount";
import { roomEmojiEventEmitter } from "#server/services/message/events/roomEmojiEventEmitter";
import { getBucket } from "#server/services/storage/getBucket";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "#server/trpc/procedure/room/getPermissionsProcedure";
import { getRoomEventSubscription } from "#server/trpc/procedure/room/getRoomEventSubscription";
import { createRoomEmojiInputSchema } from "#shared/models/db/roomEmoji/CreateRoomEmojiInput";
import { deleteRoomEmojiInputSchema } from "#shared/models/db/roomEmoji/DeleteRoomEmojiInput";
import { generateUploadRoomEmojiSasEntityInputSchema } from "#shared/models/db/roomEmoji/GenerateUploadRoomEmojiSasEntityInput";
import { updateRoomEmojiInputSchema } from "#shared/models/db/roomEmoji/UpdateRoomEmojiInput";
import { MAX_ROOM_EMOJI_SIZE_BYTES, MAX_ROOM_EMOJIS } from "#shared/services/message/constants";
import { createPresignedPutUrl } from "@esposter/db";
import {
  StorageBucket,
  DatabaseEntityType,
  getMimeCategory,
  getRoomEmojiBlobName,
  MimeCategory,
  roomEmojisInMessage,
  roomIdSchema,
  RoomPermission,
  roomsInMessage,
} from "@esposter/db-schema";
import { noop, Operation } from "@esposter/shared";
import { and, eq, notExists, sql } from "drizzle-orm";

export const emojiRouter = router({
  createRoomEmoji: getPermissionsProcedure(
    RoomPermission.ManageEmojis,
    createRoomEmojiInputSchema,
    "roomId",
    RateLimiterType.Slow,
  ).mutation<RoomEmojiWithSasUrl>(async ({ ctx, input: { id, name, roomId } }) => {
    const bucket = getBucket(StorageBucket.MessageAssets);
    // The row may only name a blob that landed. Nothing else proves the upload happened: the write SAS was
    // Handed out before the PUT, so a create that skipped it would list an emoji that renders as a broken image
    // The declared size is an input check the client could lie about, so the row is only created for a blob
    // Whose bytes are actually within the cap — a write SAS cannot constrain what is PUT through it
    const uploadedObject = await bucket.head(getRoomEmojiBlobName(roomId, id));
    if (!uploadedObject || uploadedObject.size > MAX_ROOM_EMOJI_SIZE_BYTES)
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.RoomEmoji, id);

    if (checkIsUnicodeEmojiSlug(name))
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.RoomEmoji, name);

    const roomEmojiContext = JSON.stringify({ name, roomId });
    // The cap and the name are checked by the insert itself: the row is only selected while the room holds fewer emoji
    // Than the cap and none of its emoji already answers to the name. Both refusals are the same answer, so one check
    const newRoomEmoji = requireMutation(
      (
        await ctx.db
          .insert(roomEmojisInMessage)
          .select(
            ctx.db
              .select({
                ...getInsertSelectMetadata(roomEmojisInMessage),
                id: sql`${id}`,
                name: sql`${name}`,
                roomId: roomsInMessage.id,
              })
              .from(roomsInMessage)
              .where(
                and(
                  eq(roomsInMessage.id, roomId),
                  sql`(select count(*) from ${roomEmojisInMessage} where ${eq(roomEmojisInMessage.roomId, roomId)}) < ${MAX_ROOM_EMOJIS}`,
                  notExists(
                    ctx.db
                      .select({ _: sql`1` })
                      .from(roomEmojisInMessage)
                      .where(and(eq(roomEmojisInMessage.roomId, roomId), eq(roomEmojisInMessage.name, name))),
                  ),
                ),
              ),
          )
          .returning()
      )[0],
      Operation.Create,
      DatabaseEntityType.RoomEmoji,
      roomEmojiContext,
    );
    const roomEmojiWithSasUrl = await getRoomEmojiWithSasUrl(StorageBucket.MessageAssets, newRoomEmoji);
    roomEmojiEventEmitter.emit("createRoomEmoji", [roomEmojiWithSasUrl, getDevice(ctx.getSessionPayload)]);
    return roomEmojiWithSasUrl;
  }),
  deleteRoomEmoji: getPermissionsProcedure(
    RoomPermission.ManageEmojis,
    deleteRoomEmojiInputSchema,
    "roomId",
  ).mutation<RoomEmojiInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const deletedRoomEmoji = requireMutation(
      (
        await ctx.db
          .delete(roomEmojisInMessage)
          .where(inRoom(roomEmojisInMessage, id, roomId))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.RoomEmoji,
      id,
    );
    roomEmojiEventEmitter.emit("deleteRoomEmoji", [{ id, roomId }, getDevice(ctx.getSessionPayload)]);
    // Best-effort and post-persist: a dropped publish orphans one blob under a prefix the room's own teardown
    // Sweeps anyway, and every reaction and token naming this id already renders its fallback
    await publishBlobDeletion(StorageBucket.MessageAssets, [getRoomEmojiBlobName(roomId, id)]).match(
      noop,
      console.error,
    );
    return deletedRoomEmoji;
  }),
  generateUploadRoomEmojiSasEntity: getPermissionsProcedure(
    RoomPermission.ManageEmojis,
    generateUploadRoomEmojiSasEntityInputSchema,
    "roomId",
    RateLimiterType.Slow,
  ).query<{ id: string; sasUrl: string }>(async ({ ctx, input: { mimetype, roomId, size } }) => {
    if (size > MAX_ROOM_EMOJI_SIZE_BYTES || getMimeCategory(mimetype) !== MimeCategory.Image)
      throw getInvalidOperationError(
        Operation.Create,
        DatabaseEntityType.RoomEmoji,
        JSON.stringify({ mimetype, size }),
      );
    // Rejected here rather than at create, so a room at its cap never receives a write target it cannot use.
    // The create checks again inside its own statement — this check is the early no, not the guarantee
    const roomEmojiCount = await readRoomEmojiCount(ctx.db, roomId);
    if (roomEmojiCount >= MAX_ROOM_EMOJIS)
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.RoomEmoji, roomId);

    const id: string = crypto.randomUUID();
    const sasUrl = await createPresignedPutUrl(
      getStorageCredentials(),
      StorageBucket.MessageAssets,
      getRoomEmojiBlobName(roomId, id),
      mimetype,
    );
    return { id, sasUrl };
  }),
  onCreateRoomEmoji: getRoomEventSubscription(roomEmojiEventEmitter, "createRoomEmoji", ({ roomId }) => roomId),
  onDeleteRoomEmoji: getRoomEventSubscription(roomEmojiEventEmitter, "deleteRoomEmoji", ({ roomId }) => roomId),
  onUpdateRoomEmoji: getRoomEventSubscription(roomEmojiEventEmitter, "updateRoomEmoji", ({ roomId }) => roomId),
  // Membership rather than the `ManageEmojis` its panel is gated on: the picker and every rendered message read
  // This, so the list is already the room's to see — the panel is a management surface over public-to-the-room data
  readRoomEmojis: getMemberProcedure(roomIdSchema, "roomId").query<RoomEmojiWithSasUrl[]>(
    async ({ ctx, input: { roomId } }) => {
      const roomEmojis = await ctx.db.query.roomEmojisInMessage.findMany({ where: { roomId: { eq: roomId } } });
      return Promise.all(roomEmojis.map((roomEmoji) => getRoomEmojiWithSasUrl(StorageBucket.MessageAssets, roomEmoji)));
    },
  ),
  updateRoomEmoji: getPermissionsProcedure(
    RoomPermission.ManageEmojis,
    updateRoomEmojiInputSchema,
    "roomId",
  ).mutation<RoomEmojiInMessage>(async ({ ctx, input: { id, name, roomId } }) => {
    if (checkIsUnicodeEmojiSlug(name))
      throw getInvalidOperationError(Operation.Update, DatabaseEntityType.RoomEmoji, name);

    const updatedRoomEmoji = requireMutation(
      (
        await ctx.db
          .update(roomEmojisInMessage)
          .set({ name })
          // The room's other emoji are the ones this name may not already belong to, and the unique index is
          // What makes that true — matching here is what turns a taken name into a stated refusal
          .where(
            and(inRoom(roomEmojisInMessage, id, roomId), notExists(getRoomEmojiNameQuery(ctx.db, id, name, roomId))),
          )
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.RoomEmoji,
      id,
    );
    roomEmojiEventEmitter.emit("updateRoomEmoji", [updatedRoomEmoji, getDevice(ctx.getSessionPayload)]);
    return updatedRoomEmoji;
  }),
});
