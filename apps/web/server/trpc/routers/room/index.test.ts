/* oxlint-disable no-await-in-loop -- Bounded concurrency: each chunk waits for the last, so the proxy never holds
   them all */
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { BlobDeletionQueueMessage } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import {
  roomObjectCalls,
  roomObjectFailures,
  roomObjectReplies,
} from "#server/composables/realtime/useRoomObject.test";
import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { banRoomMember } from "#server/services/message/moderation/banRoomMember";
import { getRoomProfileImageBlobPrefix } from "#server/services/room/getRoomProfileImageBlobPrefix";
import { getBucket } from "#server/services/storage/getBucket";
import { setupMockStorageBucket } from "#server/services/storage/setupMockStorageBucket.test";
import { createMockAuthSession, createMockCaller, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { bookmarkRouter } from "#server/trpc/routers/bookmark";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { inviteRouter } from "#server/trpc/routers/invite";
import { roleRouter } from "#server/trpc/routers/role";
import { createDirectMessageWithFriend } from "#server/trpc/routers/room/createDirectMessageWithFriend.test";
import { roomRouter } from "#server/trpc/routers/room/index";
import { webhookRouter } from "#server/trpc/routers/webhook";
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { MimeType } from "#shared/models/file/MimeType";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { roomTable } from "#src/services/message/room/constants";
import { getRoomPatchEntry } from "#src/services/message/room/getRoomPatchEntry";
import { readAllResourcePages } from "#src/services/resource/readAllResourcePages";
import { deleteDirectory } from "@esposter/db";
import { MockJobQueueDatabase } from "@esposter/db-mock";
import {
  appUsersInMessage,
  bansInMessage,
  DatabaseEntityType,
  friendsInSocial,
  getLiveRowWhere,
  getRoomEmojiBlobName,
  invitesInMessage,
  MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES,
  MessageType,
  PublicUserColumns,
  QueueJob,
  roomEmojisInMessage,
  RoomPermission,
  roomsInMessage,
  StorageBucket,
  userStatusesInMessage,
  usersToRoomsInMessage,
  webhooksInMessage,
  WRITE_PRESIGNED_URL_DURATION_MS,
} from "@esposter/db-schema";
import { chunk, InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// Uploaded through the client, so the object is stamped now
const uploadPublicUserAssetBlob = async (blobName: string) => {
  const bucket = getBucket(StorageBucket.PublicUserAssets);
  await bucket.put(blobName, Buffer.alloc(0));
};

// A room another user owns, which the viewer bookmarks from outside it. The bookmark is taken before the viewer joins,
// So the dock lists the room unavailable until the link the owner made admits the viewer
const createBookmarkedJoinableRoom = async (context: Context) => {
  const owner = await createMockAuthSession(context.db);
  const ownerContext: Context = { ...context, session: owner.session, user: owner.user };
  const room = await createCallerFactory(roomRouter)(ownerContext).createRoom({ name: "name" });
  const { invite } = await createCallerFactory(inviteRouter)(ownerContext).createInvite({
    expireAfterMinutes: 0,
    maxUses: 0,
    roomId: room.id,
  });
  const path = `/rooms/${room.id}`;
  const title = "title";
  const bookmark = await createCallerFactory(bookmarkRouter)(context).toggleBookmark({
    mark: { id: room.id, type: PageMarkType.Room },
    path,
    title,
  });
  return { bookmark, invite, path, room, title };
};

describe("roomRouter", () => {
  let mockContext: Context;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let inviteCaller: DecorateRouterRecord<TRPCRouter["invite"]>;
  const { getMockBucket: getMessageAssets } = setupMockStorageBucket(StorageBucket.MessageAssets);
  // An empty attachment under a room's prefix, written outside the loops that write many
  const putBlob = (blobName: string) => getMessageAssets().put(blobName, Buffer.alloc(0));
  const { getMockBucket: getPublicUserAssets } = setupMockStorageBucket(StorageBucket.PublicUserAssets);
  const name = "name";
  const expireAfterMinutes = InviteExpireAfterMinutesMap["30 minutes"];
  const updatedName = "updatedName";
  const maxUses = takeOne([...INVITE_MAX_USES_OPTIONS]);
  // A link with uses to spare, for the joins that must count one of them
  const spareMaxUses = INVITE_MAX_USES_OPTIONS[1];
  const imageUpload = { mimetype: MimeType.Png, size: 1 };
  const publicUserAssetsUrlPrefix = `${TEST_ORIGIN}/${StorageBucket.PublicUserAssets}/`;
  const getBlobName = (publicUrl: string) => publicUrl.slice(publicUserAssetsUrlPrefix.length);
  // A link that never lapses, which is what every test not about expiry or exhaustion joins through
  const createUnlimitedInvite = async (inviteRoomId: string) =>
    (await inviteCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: inviteRoomId })).invite;
  // A caller signed in as a user who holds no membership of the room under test
  const createStrangerRoomCaller = async () =>
    createMockCaller(roomRouter, await createMockAuthSession(mockContext.db));
  // The membership row as stored, a removed one included, which the live readers leave out
  const readMembership = (roomId: string, userId: string) =>
    mockContext.db.query.usersToRoomsInMessage.findFirst({ where: { roomId: { eq: roomId }, userId: { eq: userId } } });

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomCaller = createCallerFactory(roomRouter)(mockContext);
    roleCaller = createCallerFactory(roleRouter)(mockContext);
    inviteCaller = createCallerFactory(inviteRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    roomObjectCalls.length = 0;
    roomObjectFailures.clear();
    userObjectCalls.length = 0;
  });

  afterEach(async () => {
    vi.useRealTimers();
    roomObjectFailures.clear();
    roomObjectReplies.clear();
    await deleteDirectory(getMessageAssets());
    await deleteDirectory(getPublicUserAssets());
    MockJobQueueDatabase.clear();
    await mockContext.db.delete(friendsInSocial);
    await mockContext.db.delete(roomsInMessage);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    expect(newRoom.name).toBe(name);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const room = await roomCaller.readRoom(newRoom.id);

    expect(room).toStrictEqual(newRoom);
  });

  test("fails read with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const strangerRoomCaller = await createStrangerRoomCaller();

    await expect(strangerRoomCaller.readRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  test("reads empty rooms", async () => {
    expect.hasAssertions();

    const rooms = await roomCaller.readRooms();

    expect(rooms).toStrictEqual({ items: [], nextCursor: "" });
  });

  test("reads multiple with roomId with inclusive filter", async () => {
    expect.hasAssertions();

    const newRoom1 = await roomCaller.createRoom({ name: `${name}1` });
    await roomCaller.createRoom({ name: `${name}2` });
    const rooms = await roomCaller.readRooms({ filter: { name: "1" }, roomId: newRoom1.id });

    expect(rooms.items).toHaveLength(1);
    expect(takeOne(rooms.items)).toStrictEqual({ ...newRoom1, displayName: newRoom1.name });
  });

  test("reads the room named by roomId alongside the filter's own matches", async () => {
    expect.hasAssertions();

    const newRoom1 = await roomCaller.createRoom({ name: `${name}1` });
    const newRoom2 = await roomCaller.createRoom({ name: `${name}2` });
    const rooms = await roomCaller.readRooms({ filter: { name: "2" }, roomId: newRoom1.id });

    expect(rooms.items).toHaveLength(2);
    expect(takeOne(rooms.items)).toStrictEqual({ ...newRoom2, displayName: newRoom2.name });
    expect(takeOne(rooms.items, 1)).toStrictEqual({ ...newRoom1, displayName: newRoom1.name });
  });

  test("fails read multiple with room not joined", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const strangerRoomCaller = await createStrangerRoomCaller();

    await expect(strangerRoomCaller.readRooms({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads the room with the latest message", async () => {
    expect.hasAssertions();

    await roomCaller.createRoom({ name });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(1));
    const newRoom = await roomCaller.createRoom({ name });
    const room = await roomCaller.readRoom();

    expect(room).toStrictEqual(newRoom);
  });

  test("reads the room with the latest message as undefined when there are no rooms", async () => {
    expect.hasAssertions();

    const room = await roomCaller.readRoom();

    expect(room).toBeUndefined();
  });

  test("reads the room with the latest message excluding direct messages", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await createDirectMessageWithFriend(mockContext);
    const room = await roomCaller.readRoom();

    expect(room).toStrictEqual(newRoom);
  });

  test("generates profile image upload url", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { presignedUrl, publicUrl } = await roomCaller.generateProfileImageUploadUrl({
      ...imageUpload,
      roomId: newRoom.id,
    });
    // The leaf is a per-upload uuid, so the knowable part is the versioned prefix; the presigned write url names the
    // Public url's blob and lapses one write duration after it is signed. The prefix is spelled out
    // Rather than built from the helper so the documented rooms/ namespace is pinned by the test
    const blobPrefix = `${publicUserAssetsUrlPrefix}rooms/${newRoom.id}/ProfileImage/`;
    const parsedPresignedUrl = new URL(presignedUrl);

    expect(publicUrl.startsWith(blobPrefix)).toBe(true);
    expect(parsedPresignedUrl.pathname).toContain(`/${getBlobName(publicUrl)}`);
    expect(parsedPresignedUrl.searchParams.get("X-Amz-Expires")).toBe(String(WRITE_PRESIGNED_URL_DURATION_MS / 1000));
  });

  test("fails generate profile image upload url with a file over the size cap", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const input = { mimetype: MimeType.Png, roomId: newRoom.id, size: MAX_FILE_REQUEST_SIZE + 1 };

    await expect(roomCaller.generateProfileImageUploadUrl(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.File, JSON.stringify({ mimetype: input.mimetype, size: input.size })).message}]`,
    );
  });

  test("fails generate profile image upload url with an svg image", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const input = { mimetype: MimeType.Svg, size: imageUpload.size };

    await expect(
      roomCaller.generateProfileImageUploadUrl({ ...input, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.File, JSON.stringify(input)).message}]`,
    );
  });

  test(`fails generate profile image upload url for a member without ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db, member));

    await expect(
      memberRoomCaller.generateProfileImageUploadUrl({ ...imageUpload, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  // The rename line is drawn in the room's own voice, so the server writes it with the rename rather than trusting a
  // Member to post one
  test("writes the rename line when the name changes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newName = "newName";
    await roomCaller.updateRoom({ id: newRoom.id, name: newName });

    expect(roomObjectCalls).toContainEqual({
      args: [{ message: newName, type: MessageType.EditRoom }, { userId: getMockSession().user.id }],
      method: "createMessage",
      roomId: newRoom.id,
    });
  });

  // The client's PUT lands the bytes the presigned url could not bound, so a save naming the room image checks them
  test("fails updateRoom with a room image over the size cap, and deletes it", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobName = `rooms/${newRoom.id}/ProfileImage/${v7()}`;
    await getPublicUserAssets().put(blobName, Buffer.alloc(MAX_FILE_REQUEST_SIZE + 1));

    await expect(
      roomCaller.updateRoom({ id: newRoom.id, image: `${publicUserAssetsUrlPrefix}${blobName}` }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Room, newRoom.id).message}]`,
    );
    await expect(getPublicUserAssets().head(blobName)).resolves.toBeNull();
  });

  test("publishes profile image deletion on clear", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobName = `rooms/${newRoom.id}/ProfileImage/${v7()}`;
    const publicUrl = `${publicUserAssetsUrlPrefix}${blobName}`;
    await getPublicUserAssets().put(blobName, Buffer.alloc(0));
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    // R2 stamps the seeded object with its own clock, so the clock moves on past that stamp by a write window: the
    // Sweep that clears the image then sees the object as older than its cutoff
    const seededBlob = await getPublicUserAssets().head(blobName);
    assert.exists(seededBlob);
    vi.setSystemTime(
      Temporal.Instant.fromEpochMilliseconds(seededBlob.uploaded.getTime() + WRITE_PRESIGNED_URL_DURATION_MS + 1),
    );
    const data = await roomCaller.updateRoom({ id: newRoom.id, image: "" });
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion);
    assert.exists(blobDeletionEvents);

    expect(data.image).toBe("");
    expect(blobDeletionEvents).toHaveLength(1);
    expect(takeOne(blobDeletionEvents) as BlobDeletionQueueMessage).toStrictEqual({
      blobNames: [blobName],
      storageBucket: StorageBucket.PublicUserAssets,
    });
    await expect(getPublicUserAssets().head(blobName)).resolves.not.toBeNull();
  });

  // The version being replaced gets no exemption from the age filter: the submitted url is whatever the caller's
  // Form loaded with, so the row value it replaces is the one that can name another admin's seconds-old upload.
  // A version replaced this soon waits for the next image change to collect it
  test("leaves the replaced profile image younger than the presigned write url for a later sweep", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { publicUrl } = await roomCaller.generateProfileImageUploadUrl({ ...imageUpload, roomId: newRoom.id });
    const blobName = getBlobName(publicUrl);
    // Uploaded through the client, so the mock dates it now
    await uploadPublicUserAssetBlob(blobName);
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    const { publicUrl: replacementPublicUrl } = await roomCaller.generateProfileImageUploadUrl({
      ...imageUpload,
      roomId: newRoom.id,
    });
    await roomCaller.updateRoom({ id: newRoom.id, image: replacementPublicUrl });

    expect(MockJobQueueDatabase.size).toBe(0);
    await expect(getPublicUserAssets().head(blobName)).resolves.not.toBeNull();
  });

  // The lost-update race the age filter exists for: a save whose form opened before the other admin's upload
  // Carries a stale url, so the row value it replaces is that admin's live avatar
  test("names nothing for deletion when the save carries an image url the room has already moved past", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { publicUrl: staleUrl } = await roomCaller.generateProfileImageUploadUrl({
      ...imageUpload,
      roomId: newRoom.id,
    });
    const { publicUrl: freshUrl } = await roomCaller.generateProfileImageUploadUrl({
      ...imageUpload,
      roomId: newRoom.id,
    });
    const freshBlobName = getBlobName(freshUrl);
    await uploadPublicUserAssetBlob(freshBlobName);
    // The other admin's save landed first, so the row already points at the fresh avatar
    await roomCaller.updateRoom({ id: newRoom.id, image: freshUrl });
    MockJobQueueDatabase.clear();
    await roomCaller.updateRoom({ id: newRoom.id, image: staleUrl, name: updatedName });

    expect(MockJobQueueDatabase.size).toBe(0);
    await expect(getPublicUserAssets().head(freshBlobName)).resolves.not.toBeNull();
  });

  test("keeps a profile image blob younger than the presigned write url out of the deletion sweep", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobName = `rooms/${newRoom.id}/ProfileImage/${v7()}`;
    const publicUrl = `${publicUserAssetsUrlPrefix}${blobName}`;
    // Seeded rather than uploaded, so it is stamped before the in-flight upload and the sweep collects it
    await getPublicUserAssets().put(blobName, Buffer.alloc(0));
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    const { publicUrl: inFlightPublicUrl } = await roomCaller.generateProfileImageUploadUrl({
      ...imageUpload,
      roomId: newRoom.id,
    });
    const inFlightBlobName = getBlobName(inFlightPublicUrl);
    // Uploaded through the client — the state a second admin's in-flight save is in. R2 stamps it with its own clock,
    // So the clock is set to that stamp plus a write window: the cutoff the sweep applies is then exactly the upload's
    // Own time, which it is not older than
    await uploadPublicUserAssetBlob(inFlightBlobName);
    const inFlightBlob = await getPublicUserAssets().head(inFlightBlobName);
    assert.exists(inFlightBlob);
    vi.setSystemTime(
      Temporal.Instant.fromEpochMilliseconds(inFlightBlob.uploaded.getTime() + WRITE_PRESIGNED_URL_DURATION_MS),
    );
    await roomCaller.updateRoom({ id: newRoom.id, image: "" });
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion);
    assert.exists(blobDeletionEvents);

    expect(takeOne(blobDeletionEvents) as BlobDeletionQueueMessage).toStrictEqual({
      blobNames: [blobName],
      storageBucket: StorageBucket.PublicUserAssets,
    });
    await expect(getPublicUserAssets().head(inFlightBlobName)).resolves.not.toBeNull();
  });

  // The column is free text, so the dropped value is only a blob name if an upload could have written it — the
  // Deletion url normalizes the dot segments away and would otherwise resolve into another container entirely
  test("sweeps nothing when the dropped image names a blob outside the room's prefixes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const victimBlobName = `${v7()}/${v7()}`;
    const craftedImage = `${publicUserAssetsUrlPrefix}${getRoomProfileImageBlobPrefix(newRoom.id)}/../../../${victimBlobName}`;
    await roomCaller.updateRoom({ id: newRoom.id, image: craftedImage });
    await roomCaller.updateRoom({ id: newRoom.id, image: "" });

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  // A save that carries back the url it loaded with replaced nothing, so it must sweep nothing — otherwise a
  // Rename submitted from a form opened before another admin's upload deletes that admin's new avatar
  test("sweeps nothing when the update resubmits the image unchanged", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { publicUrl } = await roomCaller.generateProfileImageUploadUrl({ ...imageUpload, roomId: newRoom.id });
    const blobName = getBlobName(publicUrl);
    await uploadPublicUserAssetBlob(blobName);
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    MockJobQueueDatabase.clear();
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl, name });

    expect(MockJobQueueDatabase.size).toBe(0);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const updatedRoom = await roomCaller.updateRoom({ id: newRoom.id, name: updatedName });

    expect(updatedRoom.name).toBe(updatedName);
  });

  test("trims name on update", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const updatedRoom = await roomCaller.updateRoom({ id: newRoom.id, name: ` ${updatedName} ` });

    expect(updatedRoom.name).toBe(updatedName);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    const id = v7();

    await expect(roomCaller.updateRoom({ id, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test(`fails update for a member without ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db, member));

    await expect(memberRoomCaller.updateRoom({ id: newRoom.id, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("announces a rename to the room's online members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const updatedRoom = await roomCaller.updateRoom({ id: newRoom.id, name: updatedName });

    expect(roomObjectCalls).toContainEqual({
      args: [{ data: updatedRoom, type: "updateRoom" }],
      method: "notifyOnlineMembers",
      roomId: newRoom.id,
    });
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const deletedMembership = await roomCaller.deleteRoom(newRoom.id);

    expect(deletedMembership).toStrictEqual(await readMembership(newRoom.id, getMockSession().user.id));
  });

  test("deletes the room's role links with its membership", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const role = await roleCaller.createRole({ id: v7(), name, roomId: newRoom.id });
    await roleCaller.assignRole({ roleId: role.id, roomId: newRoom.id, userId: getMockSession().user.id });
    const readLiveRoleLinks = () =>
      mockContext.db.query.usersToRoomRolesInMessage.findMany({
        where: { RAW: getLiveRowWhere, roomId: { eq: newRoom.id } },
      });

    await expect(readLiveRoleLinks()).resolves.toStrictEqual([
      {
        createdAt: new Date(0),
        deletedAt: null,
        roleId: role.id,
        roomId: newRoom.id,
        updatedAt: new Date(0),
        userId: getMockSession().user.id,
        version: 0,
      },
    ]);

    await roomCaller.deleteRoom(newRoom.id);

    await expect(readLiveRoleLinks()).resolves.toStrictEqual([]);
  });

  // A deleted room's invites, webhooks, the bot identities its webhooks post as, its emoji and its bans are kept as
  // Tombstones, the way its roles and links are, so no live child outlives the room
  test("deletes the room's invites, webhooks, app users, emoji and bans as tombstones", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const invite = await createUnlimitedInvite(newRoom.id);
    const { webhook } = await createCallerFactory(webhookRouter)(mockContext).createWebhook({
      name,
      roomId: newRoom.id,
    });
    const emojiId = v7();
    await putBlob(getRoomEmojiBlobName(newRoom.id, emojiId));
    await roomCaller.emoji.createRoomEmoji({ id: emojiId, name, roomId: newRoom.id });
    const bannedAuthSession = await createMockAuthSession(mockContext.db);
    await banRoomMember(mockContext.db, getMockSession().user.id, newRoom.id, bannedAuthSession.user.id);

    await roomCaller.deleteRoom(newRoom.id);

    const deletedAt = new Date(0);
    await expect(
      mockContext.db
        .select({ deletedAt: invitesInMessage.deletedAt })
        .from(invitesInMessage)
        .where(eq(invitesInMessage.id, invite.id)),
    ).resolves.toStrictEqual([{ deletedAt }]);
    await expect(
      mockContext.db
        .select({ deletedAt: webhooksInMessage.deletedAt })
        .from(webhooksInMessage)
        .where(eq(webhooksInMessage.id, webhook.id)),
    ).resolves.toStrictEqual([{ deletedAt }]);
    await expect(
      mockContext.db
        .select({ deletedAt: appUsersInMessage.deletedAt })
        .from(appUsersInMessage)
        .where(eq(appUsersInMessage.id, webhook.userId)),
    ).resolves.toStrictEqual([{ deletedAt }]);
    await expect(
      mockContext.db
        .select({ deletedAt: roomEmojisInMessage.deletedAt })
        .from(roomEmojisInMessage)
        .where(eq(roomEmojisInMessage.id, emojiId)),
    ).resolves.toStrictEqual([{ deletedAt }]);
    await expect(
      mockContext.db
        .select({ deletedAt: bansInMessage.deletedAt })
        .from(bansInMessage)
        .where(eq(bansInMessage.roomId, newRoom.id)),
    ).resolves.toStrictEqual([{ deletedAt }]);
  });

  test("fails delete with direct message room", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);

    await expect(roomCaller.deleteRoom(directMessage.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, directMessage.id).message}]`,
    );
  });

  // However many attachments a room holds, its delete publishes one prefix event and never enumerates them.
  // Walking the directory here would put an unbounded listing — and the events it chunks into — on the
  // Owner's request; the handler does it instead, where a retry is free and the time budget is not a user's.
  test("publishes a single prefix deletion event for the room's attachments on delete", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobNames = Array.from(
      { length: MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES + 1 },
      (_value, index) => `${newRoom.id}/${index}`,
    );
    // Fifty at a time: Miniflare's local proxy resets its connections when hundreds of writes open at once
    for (const blobNameChunk of chunk(blobNames, 50))
      await Promise.all(blobNameChunk.map((blobName) => putBlob(blobName)));
    await roomCaller.deleteRoom(newRoom.id);
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion);
    assert.exists(blobDeletionEvents);

    expect(blobDeletionEvents).toHaveLength(1);
    expect(takeOne(blobDeletionEvents) as BlobDeletionQueueMessage).toStrictEqual({
      prefix: newRoom.id,
      storageBucket: StorageBucket.MessageAssets,
    });
  });

  test("publishes profile image deletion on delete", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobName = `rooms/${newRoom.id}/ProfileImage/${v7()}`;
    await getPublicUserAssets().put(blobName, Buffer.alloc(0));
    await roomCaller.deleteRoom(newRoom.id);
    const blobDeletionEvents = MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion);
    assert.exists(blobDeletionEvents);

    // Profile images stay a resolved list, since they are a handful. The room's attachments go out as the prefix event
    const profileImageDeletionEvents = blobDeletionEvents.filter(
      (blobDeletion) => (blobDeletion as BlobDeletionQueueMessage).storageBucket === StorageBucket.PublicUserAssets,
    );

    expect(profileImageDeletionEvents).toHaveLength(1);
    expect(takeOne(profileImageDeletionEvents) as BlobDeletionQueueMessage).toStrictEqual({
      blobNames: [blobName],
      storageBucket: StorageBucket.PublicUserAssets,
    });
  });

  test("fails delete for a user who does not own the room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const strangerRoomCaller = await createStrangerRoomCaller();

    await expect(strangerRoomCaller.deleteRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  // The object is emptied before the room is tombstoned, and the object announces nothing of the delete: each member's
  // Tombstoned membership reaches their tabs as its own row
  test("empties its object before the room is tombstoned", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await roomCaller.deleteRoom(newRoom.id);

    expect(roomObjectCalls).toContainEqual({
      args: [[getMockSession().user.id]],
      method: "deleteAll",
      roomId: newRoom.id,
    });
  });

  // The row goes only once the object has emptied, so a refused teardown leaves the room standing for the owner's retry
  test("keeps the room when its object refuses to empty, and deletes it on the retry", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    roomObjectFailures.set("deleteAll", new Error("The sender index refused"));

    await expect(roomCaller.deleteRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: The sender index refused]`,
    );
    roomObjectFailures.clear();
    await expect(roomCaller.deleteRoom(newRoom.id)).resolves.toMatchObject({ roomId: newRoom.id });
  });

  test("joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const strangerRoomCaller = await createStrangerRoomCaller();
    const joinedRoom = await strangerRoomCaller.joinRoom(newInvite.id);

    expect(joinedRoom).toStrictEqual(newRoom);
  });

  test("joining consumes a use", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { invite: newInvite } = await inviteCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses,
      roomId: newRoom.id,
    });
    const strangerRoomCaller = await createStrangerRoomCaller();
    await strangerRoomCaller.joinRoom(newInvite.id);
    // `maxUses` is 1, so the invite is now exhausted — read the row directly instead of readMyInvite
    const invite = await mockContext.db.query.invitesInMessage.findFirst({ where: { id: { eq: newInvite.id } } });

    expect(invite?.uses).toBe(1);
  });

  // Two joins at once through a link with one use left count that use once: the first writes the membership, and the
  // Second finds it and is refused as the member
  test("a rejoin at once through a link with one use left counts the use once, and refuses the second join as the member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const memberSession = await createMockAuthSession(mockContext.db);
    const memberRoomCaller = await createMockCaller(roomRouter, memberSession);
    await memberRoomCaller.joinRoom((await createUnlimitedInvite(newRoom.id)).id);
    await memberRoomCaller.leaveRoom(newRoom.id);
    const { invite: newInvite } = await inviteCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses,
      roomId: newRoom.id,
    });

    await expect(
      Promise.all([memberRoomCaller.joinRoom(newInvite.id), memberRoomCaller.joinRoom(newInvite.id)]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, JSON.stringify({ roomId: newRoom.id, userId: memberSession.user.id })).message}]`,
    );

    const invite = await mockContext.db.query.invitesInMessage.findFirst({ where: { id: { eq: newInvite.id } } });

    expect(invite?.uses).toBe(1);
  });

  test("a member who joins through a link that is used up is answered as the member they are", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { invite: newInvite } = await inviteCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses,
      roomId: newRoom.id,
    });
    const memberSession = await createMockAuthSession(mockContext.db);
    const memberRoomCaller = await createMockCaller(roomRouter, memberSession);
    await memberRoomCaller.joinRoom(newInvite.id);

    await expect(memberRoomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, JSON.stringify({ roomId: newRoom.id, userId: memberSession.user.id })).message}]`,
    );
  });

  // Two joins at once by a stranger through a link with uses to spare count one use, since the second finds the
  // Membership the first wrote, and the link's count is taken only once
  test("two joins at once through a link with uses to spare count one use, and the second is refused as the member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { invite: newInvite } = await inviteCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: spareMaxUses,
      roomId: newRoom.id,
    });
    const joinerSession = await createMockAuthSession(mockContext.db);
    const joinerRoomCaller = await createMockCaller(roomRouter, joinerSession);

    await expect(
      Promise.all([joinerRoomCaller.joinRoom(newInvite.id), joinerRoomCaller.joinRoom(newInvite.id)]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, JSON.stringify({ roomId: newRoom.id, userId: joinerSession.user.id })).message}]`,
    );

    const invite = await mockContext.db.query.invitesInMessage.findFirst({ where: { id: { eq: newInvite.id } } });

    expect(invite?.uses).toBe(1);
  });

  // A removed member is counted against a link like any other joiner, so a link that is used up admits them no more
  test("a former member cannot rejoin through a link that is used up", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const memberSession = await createMockAuthSession(mockContext.db);
    const memberRoomCaller = await createMockCaller(roomRouter, memberSession);
    await memberRoomCaller.joinRoom((await createUnlimitedInvite(newRoom.id)).id);
    await memberRoomCaller.leaveRoom(newRoom.id);
    const { invite: newInvite } = await inviteCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses,
      roomId: newRoom.id,
    });
    await (await createStrangerRoomCaller()).joinRoom(newInvite.id);

    await expect(memberRoomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );

    const membership = await readMembership(newRoom.id, memberSession.user.id);

    expect(membership?.deletedAt).not.toBeNull();
  });

  test("joining an exhausted invite fails like an unknown token", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { invite: newInvite } = await inviteCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses,
      roomId: newRoom.id,
    });
    const firstRoomCaller = await createStrangerRoomCaller();
    await firstRoomCaller.joinRoom(newInvite.id);
    const lateRoomCaller = await createStrangerRoomCaller();

    await expect(lateRoomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );
  });

  test("joining an expired invite fails like an unknown token", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { invite: newInvite } = await inviteCaller.createInvite({
      expireAfterMinutes,
      maxUses: 0,
      roomId: newRoom.id,
    });
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ minutes: expireAfterMinutes + 1 }));
    const strangerRoomCaller = await createStrangerRoomCaller();

    await expect(strangerRoomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );

    const invite = await inviteCaller.readInvite(newInvite.id);

    expect(invite).toBeUndefined();
  });

  test("pausing invites refuses a create and answers a live link like an unknown token", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    // One use, so the join that resumes proves the paused one rolled its own increment back
    const { invite: newInvite } = await inviteCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: 1,
      roomId: newRoom.id,
    });
    await roomCaller.updateRoom({ id: newRoom.id, isInvitePaused: true });

    await expect(createUnlimitedInvite(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Invite, newRoom.id).message}]`,
    );

    const strangerRoomCaller = await createStrangerRoomCaller();

    await expect(strangerRoomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );

    // The link the paused room refused is live again the moment it resumes, and it never spent the use
    await roomCaller.updateRoom({ id: newRoom.id, isInvitePaused: false });
    const laterRoomCaller = await createStrangerRoomCaller();
    const joinedRoom = await laterRoomCaller.joinRoom(newInvite.id);

    expect(joinedRoom.id).toBe(newRoom.id);
  });

  test("fails leave with direct message room", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);

    await expect(roomCaller.leaveRoom(directMessage.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, directMessage.id).message}]`,
    );
  });

  test("reads rooms excluding direct messages", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await createDirectMessageWithFriend(mockContext);
    const rooms = await roomCaller.readRooms();

    expect(rooms.items).toHaveLength(1);
    expect(takeOne(rooms.items).id).toBe(newRoom.id);
  });

  test("reads the rooms the caller shares with a user, and none only one of them is in", async () => {
    expect.hasAssertions();

    const sharedRoom = await roomCaller.createRoom({ name });
    await roomCaller.createRoom({ name: updatedName });
    const member = await createRoomMember(mockContext, sharedRoom.id);
    const mutualRooms = await roomCaller.readMutualRooms({ userId: member.id });

    expect(mutualRooms.map(({ id }) => id)).toStrictEqual([sharedRoom.id]);
  });

  test("reads no direct message as a room the caller shares with a user", async () => {
    expect.hasAssertions();

    const { user } = await createDirectMessageWithFriend(mockContext);
    const mutualRooms = await roomCaller.readMutualRooms({ userId: user.id });

    expect(mutualRooms).toStrictEqual([]);
  });

  test("reads every room to its end across page boundaries, newest first", async () => {
    expect.hasAssertions();

    const firstRoom = await roomCaller.createRoom({ name });
    const secondRoom = await roomCaller.createRoom({ name });
    const thirdRoom = await roomCaller.createRoom({ name });
    const listedIds = (await readAllResourcePages((cursor) => roomCaller.readRooms({ cursor, limit: 1 }))).map(
      ({ id }) => id,
    );

    expect(listedIds).toStrictEqual([thirdRoom.id, secondRoom.id, firstRoom.id]);
  });

  test("searches direct messages by their ordered participant display names", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "Ally" });
    const { directMessage, user } = await createDirectMessageWithFriend(mockContext);
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName: "Ally" })
      .where(and(eq(usersToRoomsInMessage.roomId, directMessage.id), eq(usersToRoomsInMessage.userId, user.id)));
    const sortName = "displayName";
    const matches = await roomCaller.readRooms({ filter: { name: "Ally" }, includeDirectMessages: true, sortName });
    const firstPage = await roomCaller.readRooms({ includeDirectMessages: true, limit: 1, sortName });
    const secondPage = await roomCaller.readRooms({
      cursor: firstPage.nextCursor,
      includeDirectMessages: true,
      limit: 1,
      sortName,
    });

    expect(matches.items.map(({ displayName }) => displayName)).toStrictEqual(["Ally", "Ally"]);
    expect([...firstPage.items, ...secondPage.items].map(({ id }) => id)).toStrictEqual(
      [newRoom.id, directMessage.id].toSorted((firstId, secondId) => firstId.localeCompare(secondId)),
    );
  });

  test("reads rooms with direct message roomId", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    const rooms = await roomCaller.readRooms({ roomId: directMessage.id });

    expect(rooms.items).toHaveLength(1);
    expect(takeOne(rooms.items).id).toBe(newRoom.id);
  });

  test("answers a banned user's join like an unknown link", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const bannedAuthSession = await createMockAuthSession(mockContext.db);
    await banRoomMember(mockContext.db, getMockSession().user.id, newRoom.id, bannedAuthSession.user.id);
    const bannedRoomCaller = await createMockCaller(roomRouter, bannedAuthSession);

    await expect(bannedRoomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );
  });

  test("fails join with joined room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);

    await expect(roomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, JSON.stringify({ roomId: newRoom.id, userId: getMockSession().user.id })).message}]`,
    );
  });

  test("announces a join to the joiner and to the room's online members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const session = await createMockAuthSession(mockContext.db);
    const sessionRoomCaller = await createMockCaller(roomRouter, session);
    await sessionRoomCaller.joinRoom(newInvite.id);

    const user = await mockContext.db.query.usersInAuth.findFirst({
      columns: PublicUserColumns,
      where: { id: { eq: session.user.id } },
    });
    assert.exists(user);
    const joinedMembership = await readMembership(newRoom.id, session.user.id);
    assert.exists(joinedMembership);
    const joinEvent = {
      data: {
        deletedAt: null,
        displayName: user.name,
        roomId: newRoom.id,
        user,
        userId: session.user.id,
        version: joinedMembership.version,
      },
      type: "joinRoom",
    };

    expect(userObjectCalls).toContainEqual({ args: [joinEvent], method: "broadcastEvent", userId: session.user.id });
    expect(roomObjectCalls).toContainEqual({ args: [joinEvent], method: "notifyOnlineMembers", roomId: newRoom.id });
  });

  test("attaches a joiner who is online to the room, and no one who is not", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const onlineSession = await createMockAuthSession(mockContext.db);
    await mockContext.db.insert(userStatusesInMessage).values({ isConnected: true, userId: onlineSession.user.id });
    const onlineRoomCaller = await createMockCaller(roomRouter, onlineSession);
    await onlineRoomCaller.joinRoom(newInvite.id);
    const offlineInvite = await createUnlimitedInvite(newRoom.id);
    const offlineSession = await createMockAuthSession(mockContext.db);
    await mockContext.db.insert(userStatusesInMessage).values({ isConnected: false, userId: offlineSession.user.id });
    const offlineRoomCaller = await createMockCaller(roomRouter, offlineSession);
    await offlineRoomCaller.joinRoom(offlineInvite.id);

    const attachedUserIds = roomObjectCalls
      .filter(({ method }) => method === "attachMember")
      .map(({ args }) => args[0]);
    expect(attachedUserIds).toStrictEqual([onlineSession.user.id]);
  });

  test("leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    vi.advanceTimersByTime(1);
    const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db, member));
    const leftMembership = await memberRoomCaller.leaveRoom(newRoom.id);

    expect(leftMembership).toStrictEqual(await readMembership(newRoom.id, member.id));
  });

  test("leaves with creator to be deleted", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const leftMembership = await roomCaller.leaveRoom(newRoom.id);

    expect(leftMembership.roomId).toBe(newRoom.id);
    await expect(roomCaller.readRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  test("announces a departure to the leaver, the room's online members, and drops the leaver's sockets", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    vi.advanceTimersByTime(1);
    const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db, member));
    const removedMembership = await memberRoomCaller.leaveRoom(newRoom.id);

    const leaveEvent = {
      data: {
        deletedAt: removedMembership.deletedAt,
        displayName: removedMembership.displayName,
        roomId: newRoom.id,
        userId: member.id,
        version: removedMembership.version,
      },
      type: "leaveRoom",
    };

    expect(roomObjectCalls).toContainEqual({ args: [member.id], method: "removeMember", roomId: newRoom.id });
    expect(roomObjectCalls).toContainEqual({ args: [leaveEvent], method: "notifyOnlineMembers", roomId: newRoom.id });
    expect(userObjectCalls).toContainEqual({ args: [leaveEvent], method: "broadcastEvent", userId: member.id });
    // The leaver's own tabs drop the room by the membership the leave tombstoned, which they hold as a row
    expect(userObjectCalls).toContainEqual({
      args: [removedMembership],
      method: "updateUserToRoom",
      userId: member.id,
    });
  });

  // A leave keeps the membership as a tombstone, so the version it leaves is the one a later arrival of the row loses
  // To
  test("a leave keeps the membership as a tombstone at a higher version", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    const joinedMembership = await readMembership(newRoom.id, member.id);
    vi.advanceTimersByTime(1);
    const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db, member));
    await memberRoomCaller.leaveRoom(newRoom.id);
    const removedMembership = await readMembership(newRoom.id, member.id);

    assert.exists(joinedMembership);
    assert.exists(removedMembership);
    expect(removedMembership.deletedAt).not.toBeNull();
    expect(removedMembership.version).toBe(joinedMembership.version + 1);
  });

  // The member list reads a removed member back as a row, so a list holding it drops the row at the version it left
  test("reads a removed member as a tombstone at the version the removal left", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    vi.advanceTimersByTime(1);
    const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db, member));
    await memberRoomCaller.leaveRoom(newRoom.id);
    const removedMembership = await readMembership(newRoom.id, member.id);
    const { items } = await roomCaller.readMembers({ roomId: newRoom.id });
    const readMember = items.find(({ id }) => id === member.id);

    assert.exists(removedMembership);
    assert.exists(readMember);
    expect(readMember.deletedAt).toStrictEqual(removedMembership.deletedAt);
    expect(readMember.version).toBe(removedMembership.version);
  });

  test("a rejoin revives the membership at a higher version, with the values a fresh membership gets", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const memberSession = await createMockAuthSession(mockContext.db);
    const memberRoomCaller = await createMockCaller(roomRouter, memberSession);
    await memberRoomCaller.joinRoom(newInvite.id);
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName: name })
      .where(
        and(eq(usersToRoomsInMessage.roomId, newRoom.id), eq(usersToRoomsInMessage.userId, memberSession.user.id)),
      );
    await memberRoomCaller.leaveRoom(newRoom.id);
    const removedMembership = await readMembership(newRoom.id, memberSession.user.id);
    await memberRoomCaller.joinRoom(newInvite.id);
    const rejoinedMembership = await readMembership(newRoom.id, memberSession.user.id);

    assert.exists(removedMembership);
    assert.exists(rejoinedMembership);
    expect(rejoinedMembership.deletedAt).toBeNull();
    expect(rejoinedMembership.displayName).toBe("");
    expect(rejoinedMembership.version).toBe(removedMembership.version + 1);
  });

  // A leave tombstones the roles its membership held, since a revival of the membership would otherwise hand them back
  test("a leave takes the member's roles with it, so a rejoin does not restore them", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await createUnlimitedInvite(newRoom.id);
    const memberSession = await createMockAuthSession(mockContext.db);
    const memberRoomCaller = await createMockCaller(roomRouter, memberSession);
    await memberRoomCaller.joinRoom(newInvite.id);
    const role = await roleCaller.createRole({ id: v7(), name, roomId: newRoom.id });
    await roleCaller.assignRole({ roleId: role.id, roomId: newRoom.id, userId: memberSession.user.id });
    await memberRoomCaller.leaveRoom(newRoom.id);
    await memberRoomCaller.joinRoom(newInvite.id);
    const memberRoles = await mockContext.db.query.usersToRoomRolesInMessage.findMany({
      where: { RAW: getLiveRowWhere, userId: { eq: memberSession.user.id } },
    });

    expect(memberRoles).toStrictEqual([]);
  });

  test("counts members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newCount = await roomCaller.readMembersCount({ roomId: newRoom.id });

    expect(newCount).toBe(1);
  });

  test("counts members without one who left", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    vi.advanceTimersByTime(1);
    const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db, member));
    await memberRoomCaller.leaveRoom(newRoom.id);
    const newCount = await roomCaller.readMembersCount({ roomId: newRoom.id });

    expect(newCount).toBe(1);
  });

  test("counts members by top role", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const rolelessCounts = await roomCaller.readMemberCountsByTopRole({ roomId: newRoom.id });

    expect(rolelessCounts).toStrictEqual([]);

    const newRole = await roleCaller.createRole({ id: v7(), name, roomId: newRoom.id });
    await roleCaller.assignRole({ roleId: newRole.id, roomId: newRoom.id, userId: getMockSession().user.id });
    const counts = await roomCaller.readMemberCountsByTopRole({ roomId: newRoom.id });

    expect(counts).toStrictEqual([{ count: 1, roleId: newRole.id }]);
  });

  test("reads members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const members = await roomCaller.readMembers({ roomId: newRoom.id });
    const userId = getMockSession().user.id;

    expect(takeOne(members.items).id).toBe(userId);
  });

  test("reads members by display name, with the value they are listed under", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { user } = getMockSession();
    const displayName = "Ally";
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName })
      .where(and(eq(usersToRoomsInMessage.roomId, newRoom.id), eq(usersToRoomsInMessage.userId, user.id)));
    const members = await roomCaller.readMembers({ filter: { name: displayName }, roomId: newRoom.id });
    const globalNameMembers = await roomCaller.readMembers({ filter: { name: user.name }, roomId: newRoom.id });

    expect(takeOne(members.items).displayName).toBe(displayName);
    expect(takeOne(globalNameMembers.items).displayName).toBe(displayName);
  });

  test("reads every member to its end across page boundaries, with equal display names broken by id", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const firstMember = await createRoomMember(mockContext, newRoom.id);
    const secondMember = await createRoomMember(mockContext, newRoom.id);
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName: "Tied" })
      .where(eq(usersToRoomsInMessage.roomId, newRoom.id));
    const listedIds = (
      await readAllResourcePages((cursor) => roomCaller.readMembers({ cursor, limit: 1, roomId: newRoom.id }))
    ).map(({ id }) => id);

    expect(listedIds).toStrictEqual(
      [getMockSession().user.id, firstMember.id, secondMember.id].toSorted((firstId, secondId) =>
        firstId.localeCompare(secondId),
      ),
    );
  });

  // A name is ordered by its letters, not its bytes, so "bob" sorts before "Carl"; the page boundary falls between them
  test("reads members in the order names read, with a page boundary between bob and Carl", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName: "Carl" })
      .where(
        and(eq(usersToRoomsInMessage.roomId, newRoom.id), eq(usersToRoomsInMessage.userId, getMockSession().user.id)),
      );
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName: "bob" })
      .where(and(eq(usersToRoomsInMessage.roomId, newRoom.id), eq(usersToRoomsInMessage.userId, member.id)));
    const firstPage = await roomCaller.readMembers({ limit: 1, roomId: newRoom.id });
    const secondPage = await roomCaller.readMembers({ cursor: firstPage.nextCursor, limit: 1, roomId: newRoom.id });

    expect(firstPage.items.map(({ displayName }) => displayName)).toStrictEqual(["bob"]);
    expect(secondPage.items.map(({ displayName }) => displayName)).toStrictEqual(["Carl"]);
  });

  test("reads users by ids with the display name they have in the room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { user } = getMockSession();
    const displayName = "Ally";
    await mockContext.db
      .update(usersToRoomsInMessage)
      .set({ displayName })
      .where(and(eq(usersToRoomsInMessage.roomId, newRoom.id), eq(usersToRoomsInMessage.userId, user.id)));
    const users = await roomCaller.readUsersByIds({ roomId: newRoom.id, userIds: [user.id] });

    expect(takeOne(users).id).toBe(user.id);
    expect(takeOne(users).displayName).toBe(displayName);
    expect(takeOne(users).isMember).toBe(true);
  });

  // A user who has left still reads by id, named by their account, so a message they wrote is named where the room
  // Shows it. The room no longer holds their membership, which is what `isMember` tells a caller
  test("reads a user who has left the room by id, named by their account", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    const memberRoomCaller = await createMockCaller(roomRouter, await createMockAuthSession(mockContext.db, member));
    await memberRoomCaller.leaveRoom(newRoom.id);
    const users = await roomCaller.readUsersByIds({ roomId: newRoom.id, userIds: [member.id] });

    expect(takeOne(users).id).toBe(member.id);
    expect(takeOne(users).displayName).toBe(member.name);
    expect(takeOne(users).isMember).toBe(false);
  });

  test("fails read users by ids for a user who is not a member of the room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const strangerRoomCaller = await createStrangerRoomCaller();

    await expect(
      strangerRoomCaller.readUsersByIds({ roomId: newRoom.id, userIds: [userId] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  // A room with no one to read still answers its refresh: an empty list reads no user, and the membership check ahead
  // Of it is what the answer's topic is taken from
  test("answers an empty list of user ids with no users", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const users = await roomCaller.readUsersByIds({ roomId: newRoom.id, userIds: [] });

    expect(users).toStrictEqual([]);
  });

  // The dock lists a room its viewer is a member of, so the join that makes them one wakes the dock's read of it
  test("a join wakes the joiner's bookmark dock that lists the room", async () => {
    expect.hasAssertions();

    const { bookmark, invite, path, room } = await createBookmarkedJoinableRoom(mockContext);
    const dockCaller = createCallerFactory(bookmarkRouter)(mockContext);
    const dockBefore = await dockCaller.readBookmarks();

    await createCallerFactory(roomRouter)(mockContext).joinRoom(invite.id);
    const dockAfter = await dockCaller.readBookmarks();

    expect(dockBefore.find((read) => read.path === path)).toStrictEqual({ ...bookmark, isAvailable: false });
    expect(dockAfter.find((read) => read.path === path)).toStrictEqual({
      ...bookmark,
      isAvailable: true,
      mark: { id: room.id, type: PageMarkType.Room },
    });
  });

  // The room update's optimistic entry shows every row its answer names, checked against the seeded state
  test("the room update's entry covers the room row the server names", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newName = "newName";
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(roomRouter)(context).updateRoom({ id: newRoom.id, name: newName }),
      context: mockContext,
      entry: getRoomPatchEntry(newRoom.id, { name: newName }),
      path: "updateRoom",
      tables: [roomTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });
});
