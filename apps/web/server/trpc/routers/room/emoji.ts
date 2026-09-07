import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { Context } from "@@/server/trpc/context";
import type { ContainerClient } from "@azure/storage-blob";
import type { RoomEmojiInMessage } from "@esposter/db-schema";

import { createRoomEmojiInputSchema } from "#shared/models/db/roomEmoji/CreateRoomEmojiInput";
import { deleteRoomEmojiInputSchema } from "#shared/models/db/roomEmoji/DeleteRoomEmojiInput";
import { generateUploadRoomEmojiSasEntityInputSchema } from "#shared/models/db/roomEmoji/GenerateUploadRoomEmojiSasEntityInput";
import { updateRoomEmojiInputSchema } from "#shared/models/db/roomEmoji/UpdateRoomEmojiInput";
import { MAX_ROOM_EMOJI_SIZE_BYTES, MAX_ROOM_EMOJIS } from "#shared/services/message/constants";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { checkIsUnicodeEmojiSlug } from "@@/server/services/message/emoji/checkIsUnicodeEmojiSlug";
import { getRoomEmojiBlobName } from "@@/server/services/message/emoji/getRoomEmojiBlobName";
import { roomEmojiEventEmitter } from "@@/server/services/message/events/roomEmojiEventEmitter";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { getRoomEventSubscription } from "@@/server/trpc/procedure/room/getRoomEventSubscription";
import { generateReadSasUrl, generateWriteSasUrl } from "@esposter/db";
import {
  AzureContainer,
  DatabaseEntityType,
  getMimeCategory,
  MimeCategory,
  roomEmojisInMessage,
  roomIdSchema,
  RoomPermission,
  roomsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, Operation, takeOne } from "@esposter/shared";
import { and, count, eq, ne, notExists } from "drizzle-orm";

// The room's other emoji answering to a name, as a subquery so the check and the update are one statement
const getRoomEmojiNameQuery = (
  db: Context["db"],
  id: RoomEmojiInMessage["id"],
  name: RoomEmojiInMessage["name"],
  roomId: RoomEmojiInMessage["roomId"],
) =>
  db
    .select({ id: roomEmojisInMessage.id })
    .from(roomEmojisInMessage)
    .where(
      and(eq(roomEmojisInMessage.roomId, roomId), eq(roomEmojisInMessage.name, name), ne(roomEmojisInMessage.id, id)),
    );
// Every surface renders an emoji from its row plus a read SAS for the blob the row's id names, so the two
// Travel together everywhere a row leaves this router
const getRoomEmojiWithSasUrl = async (
  containerClient: ContainerClient,
  roomEmoji: RoomEmojiInMessage,
): Promise<RoomEmojiWithSasUrl> => ({
  ...roomEmoji,
  sasUrl: await generateReadSasUrl(
    containerClient.getBlockBlobClient(getRoomEmojiBlobName(roomEmoji.roomId, roomEmoji.id)),
  ),
});
// An emoji is addressed by both keys so the room the permission was checked against is the room the row must
// Belong to — an id alone would let a manager of one room rename or delete another's
const getRoomEmojiWhere = (id: RoomEmojiInMessage["id"], roomId: RoomEmojiInMessage["roomId"]) =>
  and(eq(roomEmojisInMessage.id, id), eq(roomEmojisInMessage.roomId, roomId));

export const roomEmojiRouter = router({
  createRoomEmoji: getPermissionsProcedure(
    RoomPermission.ManageEmojis,
    createRoomEmojiInputSchema,
    "roomId",
    RateLimiterType.Slow,
  ).mutation<RoomEmojiWithSasUrl>(async ({ ctx, input: { id, name, roomId } }) => {
    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    // The row may only name a blob that landed. Nothing else proves the upload happened: the write SAS was
    // Handed out before the PUT, so a create that skipped it would list an emoji that renders as a broken image
    // The declared size is an input check the client could lie about, so the row is only created for a blob
    // Whose bytes are actually within the cap — a write SAS cannot constrain what is PUT through it
    const uploadedProperties = await getResultAsync(() =>
      containerClient.getBlockBlobClient(getRoomEmojiBlobName(roomId, id)).getProperties(),
    );
    const contentLength = uploadedProperties.unwrapOr(undefined)?.contentLength;
    if (contentLength === undefined || contentLength > MAX_ROOM_EMOJI_SIZE_BYTES)
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.RoomEmoji, id);

    if (checkIsUnicodeEmojiSlug(name))
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.RoomEmoji, name);

    const newRoomEmoji = await ctx.db.transaction(async (tx) => {
      // The room row is locked first, because the cap is a count and a count has no constraint behind it: two
      // Transactions reading 49 would both insert. The unique index is what makes a duplicate name impossible;
      // This is what makes the cap impossible to exceed, and it serializes only creates for the same room
      await tx
        .select({ id: roomsInMessage.id })
        .from(roomsInMessage)
        .where(eq(roomsInMessage.id, roomId))
        .for("update");
      const roomEmojiCount = takeOne(
        await tx.select({ count: count() }).from(roomEmojisInMessage).where(eq(roomEmojisInMessage.roomId, roomId)),
      ).count;
      if (roomEmojiCount >= MAX_ROOM_EMOJIS)
        throw getInvalidOperationError(
          Operation.Create,
          DatabaseEntityType.RoomEmoji,
          JSON.stringify({ name, roomId }),
        );

      const existingRoomEmoji = await tx.query.roomEmojisInMessage.findFirst({
        columns: { id: true },
        where: { name: { eq: name }, roomId: { eq: roomId } },
      });
      if (existingRoomEmoji)
        throw getInvalidOperationError(
          Operation.Create,
          DatabaseEntityType.RoomEmoji,
          JSON.stringify({ name, roomId }),
        );

      return requireMutation(
        (await tx.insert(roomEmojisInMessage).values({ id, name, roomId }).returning())[0],
        Operation.Create,
        DatabaseEntityType.RoomEmoji,
        JSON.stringify({ name, roomId }),
      );
    });
    const roomEmojiWithSasUrl = await getRoomEmojiWithSasUrl(containerClient, newRoomEmoji);
    roomEmojiEventEmitter.emit("createRoomEmoji", [
      roomEmojiWithSasUrl,
      { sessionId: ctx.getSessionPayload.session.id, userId: ctx.getSessionPayload.user.id },
    ]);
    return roomEmojiWithSasUrl;
  }),
  deleteRoomEmoji: getPermissionsProcedure(
    RoomPermission.ManageEmojis,
    deleteRoomEmojiInputSchema,
    "roomId",
  ).mutation<RoomEmojiInMessage>(async ({ ctx, input: { id, roomId } }) => {
    const deletedRoomEmoji = requireMutation(
      (await ctx.db.delete(roomEmojisInMessage).where(getRoomEmojiWhere(id, roomId)).returning())[0],
      Operation.Delete,
      DatabaseEntityType.RoomEmoji,
      id,
    );
    roomEmojiEventEmitter.emit("deleteRoomEmoji", [
      { id, roomId },
      { sessionId: ctx.getSessionPayload.session.id, userId: ctx.getSessionPayload.user.id },
    ]);
    // Best-effort and post-persist: a dropped publish orphans one blob under a prefix the room's own teardown
    // Sweeps anyway, and every reaction and token naming this id already renders its fallback
    await publishBlobDeletion(roomId, AzureContainer.MessageAssets, [getRoomEmojiBlobName(roomId, id)]);
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
    // The create counts again inside its own transaction — this check is the early no, not the guarantee
    const roomEmojiCount = takeOne(
      await ctx.db.select({ count: count() }).from(roomEmojisInMessage).where(eq(roomEmojisInMessage.roomId, roomId)),
    ).count;
    if (roomEmojiCount >= MAX_ROOM_EMOJIS)
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.RoomEmoji, roomId);

    const id: string = crypto.randomUUID();
    const containerClient = await useContainerClient(AzureContainer.MessageAssets);
    const blockBlobClient = containerClient.getBlockBlobClient(getRoomEmojiBlobName(roomId, id));
    return { id, sasUrl: await generateWriteSasUrl(blockBlobClient, { contentType: mimetype }) };
  }),
  onCreateRoomEmoji: getRoomEventSubscription(roomEmojiEventEmitter, "createRoomEmoji", ({ roomId }) => roomId),
  onDeleteRoomEmoji: getRoomEventSubscription(roomEmojiEventEmitter, "deleteRoomEmoji", ({ roomId }) => roomId),
  onUpdateRoomEmoji: getRoomEventSubscription(roomEmojiEventEmitter, "updateRoomEmoji", ({ roomId }) => roomId),
  readRoomEmojis: getMemberProcedure(roomIdSchema, "roomId").query<RoomEmojiWithSasUrl[]>(
    async ({ ctx, input: { roomId } }) => {
      const [roomEmojis, containerClient] = await Promise.all([
        ctx.db.query.roomEmojisInMessage.findMany({ where: { roomId: { eq: roomId } } }),
        useContainerClient(AzureContainer.MessageAssets),
      ]);
      return Promise.all(roomEmojis.map((roomEmoji) => getRoomEmojiWithSasUrl(containerClient, roomEmoji)));
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
          .where(and(getRoomEmojiWhere(id, roomId), notExists(getRoomEmojiNameQuery(ctx.db, id, name, roomId))))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.RoomEmoji,
      id,
    );
    roomEmojiEventEmitter.emit("updateRoomEmoji", [
      updatedRoomEmoji,
      { sessionId: ctx.getSessionPayload.session.id, userId: ctx.getSessionPayload.user.id },
    ]);
    return updatedRoomEmoji;
  }),
});
