import type { DeleteMemberInput } from "#shared/models/db/room/DeleteMemberInput";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { BlobDeletionEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { dayjs } from "#shared/services/dayjs";
import { INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { InviteExpireAfterMinutesMap } from "#shared/services/room/invite/InviteExpireAfterMinutesMap";
import { createId } from "#shared/util/math/random/createId";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { directMessageRouter } from "@@/server/trpc/routers/room/directMessage";
import {
  AzureContainer,
  DatabaseEntityType,
  friends,
  INVITE_ID_LENGTH,
  MAX_BLOB_DELETION_EVENT_BLOB_NAMES,
  roomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { MOCK_BLOB_BASE_URL, MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("room", () => {
  let mockContext: Context;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let directMessageCaller: DecorateRouterRecord<TRPCRouter["room"]["directMessage"]>;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  const roomId = crypto.randomUUID();
  const name = "name";
  const updatedName = "updatedName";
  const maxUses = takeOne([...INVITE_MAX_USES_OPTIONS]);

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomCaller = createCallerFactory(roomRouter)(mockContext);
    directMessageCaller = createCallerFactory(directMessageRouter)(mockContext);
    friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
    roleCaller = createCallerFactory(roleRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    await mockContext.db.delete(friends);
    await mockContext.db.delete(roomsInMessage);
  });

  const createFriends = async (userA: User, userB: User) => {
    await mockSessionOnce(mockContext.db, userA);
    await friendRequestCaller.sendFriendRequest(userB.id);
    await mockSessionOnce(mockContext.db, userB);
    await friendRequestCaller.acceptFriendRequest(userA.id);
  };

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

    expect(readRooms).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("reads empty rooms with undefined roomId", async () => {
    expect.hasAssertions();

    const readRooms = await roomCaller.readRooms({ roomId: undefined });

    expect(readRooms).toStrictEqual(getCursorPaginationData([], 0, []));
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

    const mainUser = getMockSession().user;
    const newRoom = await roomCaller.createRoom({ name });
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    await directMessageCaller.createDirectMessage([user.id]);
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
    const blobPrefix = `${MOCK_BLOB_BASE_URL}/${AzureContainer.PublicUserAssets}/rooms/${newRoom.id}/ProfileImage/`;

    expect(publicUrl.startsWith(blobPrefix)).toBe(true);
    expect(sasUrl).toBe(
      `${publicUrl}?sv=2025-11-05&sr=b&sig=mock-signature&st=1970-01-01T00:00:00Z&se=2099-12-31T23:59:59Z&sp=w`,
    );
  });

  test("fails generate profile image upload url without permission", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      roomCaller.generateProfileImageUploadUrl({ roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("publishes profile image deletion on clear", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const blobName = `rooms/${newRoom.id}/ProfileImage/${crypto.randomUUID()}`;
    const publicUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.PublicUserAssets}/${blobName}`;
    MockContainerDatabase.set(AzureContainer.PublicUserAssets, new Map([[blobName, Buffer.alloc(0)]]));
    await roomCaller.updateRoom({ id: newRoom.id, image: publicUrl });
    const onUpdateRoom = await roomCaller.onUpdateRoom([newRoom.id]);
    const data = await getFirstEmit(
      () => onUpdateRoom,
      () => roomCaller.updateRoom({ id: newRoom.id, image: "" }),
    );
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert(blobDeletionEvents);

    expect(data.image).toBe("");
    expect(blobDeletionEvents).toHaveLength(1);
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [blobName],
      containerName: AzureContainer.PublicUserAssets,
    });
    expect(MockContainerDatabase.get(AzureContainer.PublicUserAssets)?.has(blobName)).toBe(true);
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

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

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

  test("publishes one deletion event per blob name chunk on delete", async () => {
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
    assert(blobDeletionEvents);

    expect(blobDeletionEvents).toHaveLength(2);
    expect((takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).blobNames).toHaveLength(
      MAX_BLOB_DELETION_EVENT_BLOB_NAMES,
    );
    expect(takeOne(blobDeletionEvents, 1).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [takeOne(blobNames, MAX_BLOB_DELETION_EVENT_BLOB_NAMES)],
      containerName: AzureContainer.MessageAssets,
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

    assert(readInvite);

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

    expect(myInvite).toStrictEqual(newInvite);
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
    vi.setSystemTime(dayjs.duration(31, "minutes").asMilliseconds());
    const myInvite = await roomCaller.readMyInvite({ roomId: newRoom.id });

    expect(myInvite).toBeNull();
  });

  test("creating again replaces the previous invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const firstInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const secondInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const myInvite = await roomCaller.readMyInvite({ roomId: newRoom.id });

    expect(secondInvite.id).not.toBe(firstInvite.id);
    expect(myInvite).toStrictEqual(secondInvite);
  });

  test("creates invite with expiry and max uses", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: InviteExpireAfterMinutesMap["30 minutes"],
      maxUses,
      roomId: newRoom.id,
    });

    expect(newInvite.expiresAt).toStrictEqual(dayjs(0).add(30, "minutes").toDate());
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
    // MaxUses is 1, so the invite is now exhausted — read the row directly instead of readMyInvite
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
    vi.setSystemTime(dayjs.duration(31, "minutes").asMilliseconds());
    await mockSessionOnce(mockContext.db);

    await expect(roomCaller.joinRoom(newInvite.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, newInvite.id).message}]`,
    );

    const readInvite = await roomCaller.readInvite(newInvite.id);

    expect(readInvite).toBeNull();
  });

  test("fails create invite with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(
      roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: directMessage.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("fails read invite token with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(roomCaller.readMyInvite({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("fails leave with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(roomCaller.leaveRoom(directMessage.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("fails kick member with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(
      roomCaller.deleteMember({ roomId: directMessage.id, userId: user.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("reads rooms excluding direct messages", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const newRoom = await roomCaller.createRoom({ name });
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    await directMessageCaller.createDirectMessage([user.id]);
    const readRooms = await roomCaller.readRooms();

    expect(readRooms.items).toHaveLength(1);
    expect(takeOne(readRooms.items).id).toBe(newRoom.id);
  });

  test("reads rooms with direct message roomId", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const newRoom = await roomCaller.createRoom({ name });
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);
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

    expect(data).toStrictEqual(session.user);
  });

  test("leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: newRoom.id,
    });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    vi.advanceTimersByTime(1);
    await mockSessionOnce(mockContext.db, user);
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
    const newInvite = await roomCaller.createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: newRoom.id,
    });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    vi.advanceTimersByTime(1);
    const onLeaveRoom = await roomCaller.onLeaveRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db, user);
    const data = await getFirstEmit(
      () => onLeaveRoom,
      () => roomCaller.leaveRoom(newRoom.id),
    );

    expect(data).toBe(session.user.id);
  });

  test("counts members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newCount = await roomCaller.countMembers({ roomId: newRoom.id });

    expect(newCount).toBe(1);
  });

  test("counts members by top role", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const rolelessCounts = await roomCaller.countMembersByTopRole({ roomId: newRoom.id });

    expect(rolelessCounts).toStrictEqual([]);

    const newRole = await roleCaller.createRole({ name, roomId: newRoom.id });
    await roleCaller.assignRole({ roleId: newRole.id, roomId: newRoom.id, userId: getMockSession().user.id });
    const counts = await roomCaller.countMembersByTopRole({ roomId: newRoom.id });

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

  test("kicks member with owner", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(invite.id);
    vi.advanceTimersByTime(1);

    await roomCaller.deleteMember({ roomId: newRoom.id, userId: user.id });

    const members = await roomCaller.readMembers({ roomId: newRoom.id });

    expect(members.items.find(({ id }) => id === user.id)).toBeUndefined();
  });

  test("fails kick self with owner", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const input: DeleteMemberInput = { roomId: newRoom.id, userId };

    await expect(roomCaller.deleteMember(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, JSON.stringify(input)).message}]`,
    );
  });
});
