import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { BlobDeletionEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { createId } from "#shared/util/math/random/createId";
import { getRoomProfileImageBlobPrefix } from "@@/server/services/room/getRoomProfileImageBlobPrefix";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { createRoomMember } from "@@/server/trpc/routers/createRoomMember.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { createDirectMessageWithFriend } from "@@/server/trpc/routers/room/createDirectMessageWithFriend.test";
import {
  AzureContainer,
  DatabaseEntityType,
  friends,
  INVITE_ID_LENGTH,
  invitesInMessage,
  MAX_BLOB_DELETION_EVENT_BLOB_NAMES,
  RoomPermission,
  roomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { MOCK_BLOB_BASE_URL, MockBlockBlobClient, MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("roomRouter", () => {
  let mockContext: Context;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  const roomId = crypto.randomUUID();
  const name = "name";
  const updatedName = "updatedName";
  const maxUses = takeOne([...INVITE_MAX_USES_OPTIONS]);
  const publicUserAssetsUrlPrefix = `${MOCK_BLOB_BASE_URL}/${AzureContainer.PublicUserAssets}/`;
  const getBlobName = (publicUrl: string) => publicUrl.slice(publicUserAssetsUrlPrefix.length);

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomCaller = createCallerFactory(roomRouter)(mockContext);
    roleCaller = createCallerFactory(roleRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    await mockContext.db.delete(friends);
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
    const readRoom = await roomCaller.readRoom(newRoom.id);

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("fails read with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(roomCaller.readRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  test("reads empty rooms", async () => {
    expect.hasAssertions();

    const readRooms = await roomCaller.readRooms();

    expect(readRooms).toStrictEqual({ hasMore: false, items: [], nextCursor: "" });
  });

  test("reads empty rooms with undefined roomId", async () => {
    expect.hasAssertions();

    const readRooms = await roomCaller.readRooms({ roomId: undefined });

    expect(readRooms).toStrictEqual({ hasMore: false, items: [], nextCursor: "" });
  });

  test("reads multiple with roomId with inclusive filter", async () => {
    expect.hasAssertions();

    const newRoom1 = await roomCaller.createRoom({ name: `${name}1` });
    await roomCaller.createRoom({ name: `${name}2` });
    const readRooms = await roomCaller.readRooms({ filter: { name: "1" }, roomId: newRoom1.id });

    expect(readRooms.items).toHaveLength(1);
    expect(takeOne(readRooms.items)).toStrictEqual(newRoom1);
  });

  test("reads multiple with roomId with exclusive filter", async () => {
    expect.hasAssertions();

    const newRoom1 = await roomCaller.createRoom({ name: `${name}1` });
    const newRoom2 = await roomCaller.createRoom({ name: `${name}2` });
    const readRooms = await roomCaller.readRooms({ filter: { name: "2" }, roomId: newRoom1.id });

    expect(readRooms.items).toHaveLength(2);
    expect(takeOne(readRooms.items)).toStrictEqual(newRoom2);
    expect(takeOne(readRooms.items, 1)).toStrictEqual(newRoom1);
  });

  test("fails read multiple with non-existent room", async () => {
    expect.hasAssertions();

    await expect(roomCaller.readRooms({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails read multiple with room not joined", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(roomCaller.readRooms({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads latest updated room", async () => {
    expect.hasAssertions();

    await roomCaller.createRoom({ name });
    vi.setSystemTime(1);
    const newRoom = await roomCaller.createRoom({ name });
    const readRoom = await roomCaller.readRoom();

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("reads latest updated room with no rooms to be null", async () => {
    expect.hasAssertions();

    const readRoom = await roomCaller.readRoom();

    expect(readRoom).toBeNull();
  });

  test("reads latest updated room excluding direct messages", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await createDirectMessageWithFriend(mockContext);
    const readRoom = await roomCaller.readRoom();

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("generates profile image upload url", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { publicUrl, sasUrl } = await roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id });
    // The leaf is a per-upload uuid, so the knowable part is the versioned prefix; the sas url is the exact public
    // Url plus the mock write-sas query, which is what actually needs asserting. The prefix is spelled out
    // Rather than built from the helper so the documented rooms/ namespace is pinned by the test
    const blobPrefix = `${publicUserAssetsUrlPrefix}rooms/${newRoom.id}/ProfileImage/`;

    expect(publicUrl.startsWith(blobPrefix)).toBe(true);
    expect(sasUrl).toBe(
      `${publicUrl}?sv=2025-11-05&sr=b&sig=mock-signature&st=1970-01-01T00:00:00Z&se=2099-12-31T23:59:59Z&sp=w`,
    );
  });

  test(`fails generate profile image upload url for a member without ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    await mockSessionOnce(mockContext.db, member);

    await expect(
      roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("publishes profile image deletion on clear", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobName = `rooms/${newRoom.id}/ProfileImage/${crypto.randomUUID()}`;
    const publicUrl = `${publicUserAssetsUrlPrefix}${blobName}`;
    MockContainerDatabase.set(AzureContainer.PublicUserAssets, new Map([[blobName, Buffer.alloc(0)]]));
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    const onUpdateRoom = await roomCaller.onUpdateRoom([newRoom.id]);
    const data = await getFirstEmit(
      () => onUpdateRoom,
      () => roomCaller.updateRoom({ id: newRoom.id, image: "" }),
    );
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    expect(data.image).toBe("");
    expect(blobDeletionEvents).toHaveLength(1);
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [blobName],
      containerName: AzureContainer.PublicUserAssets,
    });
    expect(MockContainerDatabase.get(AzureContainer.PublicUserAssets)?.has(blobName)).toBe(true);
  });

  // The version being replaced gets no exemption from the age filter: the submitted url is whatever the caller's
  // Form loaded with, so the row value it replaces is the one that can name another admin's seconds-old upload.
  // A version replaced this soon waits for the next image change to collect it
  test("leaves the replaced profile image younger than the write sas for a later sweep", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { publicUrl } = await roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id });
    const blobName = getBlobName(publicUrl);
    // Uploaded through the client, so the mock dates it now
    await new MockBlockBlobClient("", AzureContainer.PublicUserAssets, blobName).upload(Buffer.alloc(0), 0);
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    const { publicUrl: replacementPublicUrl } = await roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id });
    await roomCaller.updateRoom({ id: newRoom.id, image: replacementPublicUrl });

    expect(MockEventGridDatabase.get("")).toBeUndefined();
    expect(MockContainerDatabase.get(AzureContainer.PublicUserAssets)?.has(blobName)).toBe(true);
  });

  // The lost-update race the age filter exists for: a save whose form opened before the other admin's upload
  // Carries a stale url, so the row value it replaces is that admin's live avatar
  test("names nothing for deletion when the save carries an image url the room has already moved past", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { publicUrl: staleUrl } = await roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id });
    const { publicUrl: freshUrl } = await roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id });
    const freshBlobName = getBlobName(freshUrl);
    await new MockBlockBlobClient("", AzureContainer.PublicUserAssets, freshBlobName).upload(Buffer.alloc(0), 0);
    // The other admin's save landed first, so the row already points at the fresh avatar
    await roomCaller.updateRoom({ id: newRoom.id, image: freshUrl });
    MockEventGridDatabase.clear();
    await roomCaller.updateRoom({ id: newRoom.id, image: staleUrl, name: updatedName });

    expect(MockEventGridDatabase.get("")).toBeUndefined();
    expect(MockContainerDatabase.get(AzureContainer.PublicUserAssets)?.has(freshBlobName)).toBe(true);
  });

  test("keeps a profile image blob younger than the write sas out of the deletion sweep", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobName = `rooms/${newRoom.id}/ProfileImage/${crypto.randomUUID()}`;
    const publicUrl = `${publicUserAssetsUrlPrefix}${blobName}`;
    // Seeded rather than uploaded, so the mock dates it before the write sas window and the sweep collects it
    MockContainerDatabase.set(AzureContainer.PublicUserAssets, new Map([[blobName, Buffer.alloc(0)]]));
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    const { publicUrl: inFlightPublicUrl } = await roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id });
    const inFlightBlobName = getBlobName(inFlightPublicUrl);
    // Uploaded through the client, so the mock dates it now — the state a second admin's in-flight save is in
    await new MockBlockBlobClient("", AzureContainer.PublicUserAssets, inFlightBlobName).upload(Buffer.alloc(0), 0);
    await roomCaller.updateRoom({ id: newRoom.id, image: "" });
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [blobName],
      containerName: AzureContainer.PublicUserAssets,
    });
    expect(MockContainerDatabase.get(AzureContainer.PublicUserAssets)?.has(inFlightBlobName)).toBe(true);
  });

  // The column is free text, so the dropped value is only a blob name if an upload could have written it — the
  // Deletion url normalizes the dot segments away and would otherwise resolve into another container entirely
  test("sweeps nothing when the dropped image names a blob outside the room's prefixes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const victimBlobName = `${crypto.randomUUID()}/${crypto.randomUUID()}`;
    const craftedImage = `${publicUserAssetsUrlPrefix}${getRoomProfileImageBlobPrefix(newRoom.id)}/../../../${victimBlobName}`;
    await roomCaller.updateRoom({ id: newRoom.id, image: craftedImage });
    await roomCaller.updateRoom({ id: newRoom.id, image: "" });

    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  // A save that carries back the url it loaded with replaced nothing, so it must sweep nothing — otherwise a
  // Rename submitted from a form opened before another admin's upload deletes that admin's new avatar
  test("sweeps nothing when the update resubmits the image unchanged", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { publicUrl } = await roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id });
    const blobName = getBlobName(publicUrl);
    await new MockBlockBlobClient("", AzureContainer.PublicUserAssets, blobName).upload(Buffer.alloc(0), 0);
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    MockEventGridDatabase.clear();
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl, name });

    expect(MockEventGridDatabase.get("")).toBeUndefined();
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

    const id = crypto.randomUUID();

    await expect(roomCaller.updateRoom({ id, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test(`fails update for a member without ${RoomPermission.ManageRoom} permission`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    await mockSessionOnce(mockContext.db, member);

    await expect(roomCaller.updateRoom({ id: newRoom.id, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("on updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const onUpdateRoom = await roomCaller.onUpdateRoom([newRoom.id]);
    const data = await getFirstEmit(
      () => onUpdateRoom,
      () => roomCaller.updateRoom({ id: newRoom.id, name: updatedName }),
    );

    expect(data.name).toBe(updatedName);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const deletedRoom = await roomCaller.deleteRoom(newRoom.id);

    expect(deletedRoom.id).toBe(newRoom.id);
  });

  // However many attachments a room holds, its delete publishes one prefix event and never enumerates them.
  // Walking the directory here would put an unbounded listing — and the events it chunks into — on the
  // Owner's request; the handler does it instead, where a retry is free and the time budget is not a user's.
  test("publishes a single prefix deletion event for the room's attachments on delete", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobNames = Array.from(
      { length: MAX_BLOB_DELETION_EVENT_BLOB_NAMES + 1 },
      (_value, index) => `${newRoom.id}/${index}`,
    );
    MockContainerDatabase.set(
      AzureContainer.MessageAssets,
      new Map(blobNames.map((blobName) => [blobName, Buffer.alloc(0)])),
    );
    await roomCaller.deleteRoom(newRoom.id);
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    expect(blobDeletionEvents).toHaveLength(1);
    // Unbounded in time, unlike every other prefix sweep: the room row is gone, so nothing can re-own this
    // Prefix and this is its only teardown — a `createdBefore` cutoff would permanently strand the attachment
    // Of any member still holding a write SAS when the owner deleted
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      containerName: AzureContainer.MessageAssets,
      prefix: newRoom.id,
    });
  });

  test("publishes profile image deletion on delete", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobName = `rooms/${newRoom.id}/ProfileImage/${crypto.randomUUID()}`;
    // Images uploaded before the per-upload prefix existed sit at the flat name and are swept alongside it
    const legacyBlobName = `${newRoom.id}/ProfileImage`;
    MockContainerDatabase.set(
      AzureContainer.PublicUserAssets,
      new Map([
        [blobName, Buffer.alloc(0)],
        [legacyBlobName, Buffer.alloc(0)],
      ]),
    );
    await roomCaller.deleteRoom(newRoom.id);
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    // Profile images stay a resolved list — they are a handful, and their sweep reaches a pre-cutover flat
    // Name that sits outside the room's prefix, so a prefix walk would miss it. The room's attachments go
    // Out as the prefix event alongside it.
    const profileImageDeletionEvents = blobDeletionEvents.filter(
      ({ data }) => (data as BlobDeletionEventGridData).containerName === AzureContainer.PublicUserAssets,
    );

    expect(profileImageDeletionEvents).toHaveLength(1);
    expect(takeOne(profileImageDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [blobName, legacyBlobName],
      containerName: AzureContainer.PublicUserAssets,
    });
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(roomCaller.deleteRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  test("on deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const onDeleteRoom = await roomCaller.onDeleteRoom([newRoom.id]);
    const data = await getFirstEmit(
      () => onDeleteRoom,
      () => roomCaller.deleteRoom(newRoom.id),
    );

    expect(data).toBe(newRoom.id);
  });

  test("reads invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const readInvite = await roomCaller.readInvite(newInvite.id);
    const userId = getMockSession().user.id;

    assert.exists(readInvite);

    expect(readInvite.userId).toBe(userId);
    expect(readInvite.roomId).toBe(newRoom.id);
    expect(readInvite.id).toBe(newInvite.id);
    expect(readInvite.isMember).toBe(true);
  });

  test("reads non-existent invite", async () => {
    expect.hasAssertions();

    const readInvite = await roomCaller.readInvite(createId(INVITE_ID_LENGTH));

    expect(readInvite).toBeNull();
  });

  test("reads my invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const myInvite = await roomCaller.readMyInvite({ roomId: newRoom.id });

    assert.exists(myInvite);

    // The creator rides back with a created link because the management panel lists that column; a member reading
    // Their own link already knows who minted it, so that half is the whole difference between the two rows
    expect(newInvite).toStrictEqual({ ...myInvite, user: newInvite.user });
    expect(newInvite.user.id).toBe(getMockSession().user.id);
  });

  test("reads my invite with no invite to be null", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const myInvite = await roomCaller.readMyInvite({ roomId: newRoom.id });

    expect(myInvite).toBeNull();
  });

  test("reads my expired invite to be null", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await roomCaller.createInvite({
      expireAfterMinutes: InviteExpireAfterMinutesMap["30 minutes"],
      maxUses: 0,
      roomId: newRoom.id,
    });
    vi.setSystemTime(Temporal.Duration.from({ minutes: 31 }).total("milliseconds"));
    const myInvite = await roomCaller.readMyInvite({ roomId: newRoom.id });

    expect(myInvite).toBeNull();
  });

  // The usability predicate runs over the page rather than in SQL, so a page can filter down to fewer rows than it
  // Read — and the cursor has to name the oldest row read rather than the oldest usable one, or a batch of lapsed
  // Links ends the walk in front of the usable ones behind them
  test("keeps paging room invites past a page of lapsed links", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { id: userId } = getMockSession().user;
    const usableInviteId = createId(INVITE_ID_LENGTH);
    // Newest first, so the two lapsed links are the whole of a two-row page and the usable one sits behind them
    await mockContext.db.insert(invitesInMessage).values([
      { createdAt: new Date(3), expiresAt: new Date(1), id: createId(INVITE_ID_LENGTH), roomId: newRoom.id, userId },
      { createdAt: new Date(2), expiresAt: new Date(1), id: createId(INVITE_ID_LENGTH), roomId: newRoom.id, userId },
      { createdAt: new Date(1), id: usableInviteId, roomId: newRoom.id, userId },
    ]);
    vi.setSystemTime(Temporal.Duration.from({ minutes: 1 }).total("milliseconds"));
    const lapsedPage = await roomCaller.readRoomInvites({ limit: 2, roomId: newRoom.id });

    assert(lapsedPage.nextCursor);

    const usablePage = await roomCaller.readRoomInvites({
      cursor: lapsedPage.nextCursor,
      limit: 2,
      roomId: newRoom.id,
    });

    expect(lapsedPage.items).toStrictEqual([]);
    expect(lapsedPage.hasMore).toBe(true);
    expect(usablePage.items.map(({ id }) => id)).toStrictEqual([usableInviteId]);
  });

  test("creating again replaces the previous invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const firstInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const secondInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const myInvite = await roomCaller.readMyInvite({ roomId: newRoom.id });

    expect(secondInvite.id).not.toBe(firstInvite.id);
    expect(secondInvite).toStrictEqual({ ...myInvite, user: secondInvite.user });
  });

  test("creates invite with expiry and max uses", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: InviteExpireAfterMinutesMap["30 minutes"],
      maxUses,
      roomId: newRoom.id,
    });

    expect(newInvite.expiresAt).toStrictEqual(new Date(Temporal.Duration.from({ minutes: 30 }).total("milliseconds")));
    expect(newInvite.maxUses).toBe(maxUses);
    expect(newInvite.uses).toBe(0);
  });

  test("joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);
    const joinedRoom = await roomCaller.joinRoom(newInvite.id);

    expect(joinedRoom).toStrictEqual(newRoom);
  });

  test("joining consumes a use", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses,
      roomId: newRoom.id,
    });
    await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    // `maxUses` is 1, so the invite is now exhausted — read the row directly instead of readMyInvite
    const invite = await mockContext.db.query.invitesInMessage.findFirst({ where: { id: { eq: newInvite.id } } });

    expect(invite?.uses).toBe(1);
  });

  test("joining an exhausted invite fails like an unknown token", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses,
      roomId: newRoom.id,
    });
    await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    await mockSessionOnce(mockContext.db);

    await expect(roomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );
  });

  test("joining an expired invite fails like an unknown token", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: InviteExpireAfterMinutesMap["30 minutes"],
      maxUses: 0,
      roomId: newRoom.id,
    });
    vi.setSystemTime(Temporal.Duration.from({ minutes: 31 }).total("milliseconds"));
    await mockSessionOnce(mockContext.db);

    await expect(roomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );

    const readInvite = await roomCaller.readInvite(newInvite.id);

    expect(readInvite).toBeNull();
  });

  test("revoking own invite makes the link unknown, and another member's is not revocable", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    // The member who joined through the link holds no link of their own, so revoking that one matches no row
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    await mockSessionOnce(mockContext.db, member);

    await expect(
      roomCaller.revokeInvite({ id: newInvite.id, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Invite, newInvite.id).message}]`,
    );

    await roomCaller.revokeInvite({ id: newInvite.id, roomId: newRoom.id });
    const readInvite = await roomCaller.readInvite(newInvite.id);

    expect(readInvite).toBeNull();
  });

  test("pausing invites refuses a create and answers a live link like an unknown token", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    // One use, so the join that resumes proves the paused one rolled its own increment back
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 1, roomId: newRoom.id });
    await roomCaller.updateRoom({ id: newRoom.id, isInvitePaused: true });

    await expect(
      roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Invite, newRoom.id).message}]`,
    );

    await mockSessionOnce(mockContext.db);

    await expect(roomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );

    // The link the paused room refused is live again the moment it resumes, and it never spent the use
    await roomCaller.updateRoom({ id: newRoom.id, isInvitePaused: false });
    await mockSessionOnce(mockContext.db);
    const joinedRoom = await roomCaller.joinRoom(newInvite.id);

    expect(joinedRoom.id).toBe(newRoom.id);
  });

  test("fails create invite with direct message room", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);

    await expect(
      roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: directMessage.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, directMessage.id).message}]`,
    );
  });

  test("fails read invite token with direct message room", async () => {
    expect.hasAssertions();

    const { directMessage } = await createDirectMessageWithFriend(mockContext);

    await expect(roomCaller.readMyInvite({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.Room, directMessage.id).message}]`,
    );
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
    const readRooms = await roomCaller.readRooms();

    expect(readRooms.items).toHaveLength(1);
    expect(takeOne(readRooms.items).id).toBe(newRoom.id);
  });

  test("reads rooms with direct message roomId", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { directMessage } = await createDirectMessageWithFriend(mockContext);
    const readRooms = await roomCaller.readRooms({ roomId: directMessage.id });

    expect(readRooms.items).toHaveLength(1);
    expect(takeOne(readRooms.items).id).toBe(newRoom.id);
  });

  test("fails join with joined room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: newRoom.id,
    });
    const userId = getMockSession().user.id;

    await expect(roomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Failed query: insert into "message"."usersToRooms" ("createdAt", "deletedAt", "updatedAt", "isHidden", "lastMessageAt", "mentionCount", "nickname", "notificationType", "roomId", "timeoutUntil", "userId") values (default, default, $1, default, default, default, default, default, $2, default, $3) returning "createdAt", "deletedAt", "updatedAt", "isHidden", "lastMessageAt", "mentionCount", "nickname", "notificationType", "roomId", "timeoutUntil", "userId"\nparams: 1970-01-01T00:00:00.000Z,${newRoom.id},${userId}]`,
    );
  });

  test("on joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: newRoom.id,
    });
    const onJoinRoom = await roomCaller.onJoinRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db);
    const data = await getFirstEmit(
      () => onJoinRoom,
      () => roomCaller.joinRoom(newInvite.id),
    );

    // The room travels with the member: the client subscribes for every room it is in at once, so a payload
    // Without it can only be applied to the room that happens to be open
    expect(data).toStrictEqual({ roomId: newRoom.id, user: session.user });
  });

  test("leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    vi.advanceTimersByTime(1);
    await mockSessionOnce(mockContext.db, member);
    const leftRoomId = await roomCaller.leaveRoom(newRoom.id);

    expect(leftRoomId).toStrictEqual(newRoom.id);
  });

  test("leaves with creator to be deleted", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const leftRoomId = await roomCaller.leaveRoom(newRoom.id);

    await expect(roomCaller.readRoom(leftRoomId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, leftRoomId).message}]`,
    );
  });

  test("on leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    vi.advanceTimersByTime(1);
    const onLeaveRoom = await roomCaller.onLeaveRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db, member);
    const data = await getFirstEmit(
      () => onLeaveRoom,
      () => roomCaller.leaveRoom(newRoom.id),
    );

    expect(data).toStrictEqual({ roomId: newRoom.id, userId: session.user.id });
  });

  test("counts members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newCount = await roomCaller.readMembersCount({ roomId: newRoom.id });

    expect(newCount).toBe(1);
  });

  test("counts members by top role", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const rolelessCounts = await roomCaller.readMemberCountsByTopRole({ roomId: newRoom.id });

    expect(rolelessCounts).toStrictEqual([]);

    const newRole = await roleCaller.createRole({ name, roomId: newRoom.id });
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

  test("reads members by ids", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const user = getMockSession().user;
    const members = await roomCaller.readMembersByIds({ ids: [user.id], roomId: newRoom.id });

    expect(takeOne(members).id).toBe(user.id);
  });

  test("fails read members by ids with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    await mockSessionOnce(mockContext.db);

    await expect(
      roomCaller.readMembersByIds({ ids: [userId], roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
