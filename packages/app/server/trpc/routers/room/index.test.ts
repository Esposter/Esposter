import type { DeleteMemberInput } from "#shared/models/db/room/DeleteMemberInput";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { createId } from "#shared/util/math/random/createId";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { roomRouter } from "@@/server/trpc/routers/room";
import { directMessageRouter } from "@@/server/trpc/routers/room/directMessage";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { AzureContainer, DatabaseEntityType, friends, INVITE_ID_LENGTH, roomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const expectedUsersToRoomsInsertError = (roomId: string, userId: string) =>
  `Failed query: insert into "message"."usersToRooms" ("createdAt", "deletedAt", "updatedAt", "isHidden", "lastMessageAt", "nickname", "notificationType", "roomId", "timeoutUntil", "userId") values (default, default, $1, default, default, default, default, $2, default, $3) returning "createdAt", "deletedAt", "updatedAt", "isHidden", "lastMessageAt", "nickname", "notificationType", "roomId", "timeoutUntil", "userId"\nparams: 1970-01-01T00:00:00.000Z,${roomId},${userId}`;

describe("room", () => {
  let mockContext: Context;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let directMessageCaller: DecorateRouterRecord<TRPCRouter["room"]["directMessage"]>;
  let friendRequestCaller: DecorateRouterRecord<TRPCRouter["friendRequest"]>;
  const roomId = crypto.randomUUID();
  const name = "name";
  const updatedName = "updatedName";

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomCaller = createCallerFactory(roomRouter)(mockContext);
    directMessageCaller = createCallerFactory(directMessageRouter)(mockContext);
    friendRequestCaller = createCallerFactory(friendRequestRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
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

    expect(publicUrl).toBe(
      `https://mockaccount.blob.core.windows.net/${AzureContainer.PublicUserAssets}/rooms/${newRoom.id}/ProfileImage`,
    );
    expect(sasUrl).toBe(
      `https://mockaccount.blob.core.windows.net/${AzureContainer.PublicUserAssets}/rooms/${newRoom.id}/ProfileImage?sv=2025-11-05&sr=b&sig=mock-signature&st=1970-01-01T00:00:00Z&se=2099-12-31T23:59:59Z&sp=r`,
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
    const data = await withAsyncIterator(
      () => onUpdateRoom,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          roomCaller.updateRoom({ id: newRoom.id, name: updatedName }),
        ]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.name).toBe(updatedName);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const deletedRoom = await roomCaller.deleteRoom(newRoom.id);

    expect(deletedRoom.id).toBe(newRoom.id);
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
    const data = await withAsyncIterator(
      () => onDeleteRoom,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), roomCaller.deleteRoom(newRoom.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(newRoom.id);
  });

  test("reads invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const readInvite = await roomCaller.readInvite(newInviteCode);
    const userId = getMockSession().user.id;

    assert(readInvite);

    expect(readInvite.userId).toBe(userId);
    expect(readInvite.roomId).toBe(newRoom.id);
    expect(readInvite.id).toBe(newInviteCode);
    expect(readInvite.isMember).toBe(true);
  });

  test("reads non-existent invite", async () => {
    expect.hasAssertions();

    const readInvite = await roomCaller.readInvite(createId(INVITE_ID_LENGTH));

    expect(readInvite).toBeNull();
  });

  test("reads invite id", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteId = await roomCaller.createInvite({ roomId: newRoom.id });
    const readInviteId = await roomCaller.readInviteId({ roomId: newRoom.id });

    expect(readInviteId).toBe(newInviteId);
  });

  test("read invite id with no id to be empty", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const readInviteId = await roomCaller.readInviteId({ roomId: newRoom.id });

    expect(readInviteId).toBe("");
  });

  test("creates invite to be cached", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const cachedInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });

    expect(cachedInviteCode).toBe(newInviteCode);
  });

  test("joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);
    const joinedRoom = await roomCaller.joinRoom(newInviteCode);

    expect(joinedRoom).toStrictEqual(newRoom);
  });

  test("fails create invite with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(roomCaller.createInvite({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
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

    await expect(roomCaller.readInviteId({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
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

  test("fails read multiple with direct message roomId", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await createFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(roomCaller.readRooms({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, directMessage.id).message}]`,
    );
  });

  test("fails join with joined room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const userId = getMockSession().user.id;

    await expect(roomCaller.joinRoom(newInviteCode)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${expectedUsersToRoomsInsertError(newRoom.id, userId)}]`,
    );
  });

  test("on joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const onJoinRoom = await roomCaller.onJoinRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db);
    const data = await withAsyncIterator(
      () => onJoinRoom,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), roomCaller.joinRoom(newInviteCode)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toStrictEqual(session.user);
  });

  test("leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    vi.advanceTimersByTime(1);
    await mockSessionOnce(mockContext.db, user);
    const roomId = await roomCaller.leaveRoom(newRoom.id);

    expect(roomId).toStrictEqual(newRoom.id);
  });

  test("leaves with creator to be deleted", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const roomId = await roomCaller.leaveRoom(newRoom.id);

    await expect(roomCaller.readRoom(roomId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, roomId).message}]`,
    );
  });

  test("on leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    vi.advanceTimersByTime(1);
    const onLeaveRoom = await roomCaller.onLeaveRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db, user);
    const data = await withAsyncIterator(
      () => onLeaveRoom,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), roomCaller.leaveRoom(newRoom.id)]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(session.user.id);
  });

  test("counts members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newCount = await roomCaller.countMembers({ roomId: newRoom.id });

    expect(newCount).toBe(1);
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
    const invite = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(invite);
    vi.advanceTimersByTime(1);

    await expect(roomCaller.deleteMember({ roomId: newRoom.id, userId: user.id })).resolves.toBeUndefined();

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
