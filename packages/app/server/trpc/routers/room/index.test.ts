import type { DeleteMemberInput } from "#shared/models/db/room/DeleteMemberInput";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { createCode } from "#shared/util/math/random/createCode";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { roomRouter } from "@@/server/trpc/routers/room";
import { directMessageRouter } from "@@/server/trpc/routers/room/directMessage";
import { CODE_LENGTH, DatabaseEntityType, friends, rooms } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("room", () => {
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let directMessageCaller: DecorateRouterRecord<TRPCRouter["directMessage"]>;
  let friendCaller: DecorateRouterRecord<TRPCRouter["friend"]>;
  let mockContext: Context;
  const name = "name";
  const updatedName = "updatedName";

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomCaller = createCallerFactory(roomRouter)(mockContext);
    directMessageCaller = createCallerFactory(directMessageRouter)(mockContext);
    friendCaller = createCallerFactory(friendRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(friends);
    await mockContext.db.delete(rooms);
  });

  const makeFriends = async (userA: User, userB: User) => {
    await mockSessionOnce(mockContext.db, userA);
    await friendCaller.sendFriendRequest(userB.id);
    await mockSessionOnce(mockContext.db, userB);
    await friendCaller.acceptFriendRequest(userA.id);
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

  test("fails read with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(roomCaller.readRoom(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, id).message}]`,
    );
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

    const roomId = crypto.randomUUID();

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
    const newRoom = await roomCaller.createRoom({ name });
    const readRoom = await roomCaller.readRoom();

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("reads latest updated room with no rooms to be null", async () => {
    expect.hasAssertions();

    const readRoom = await roomCaller.readRoom();

    expect(readRoom).toBeNull();
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
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Room, id).message}]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(roomCaller.updateRoom({ id: newRoom.id, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  test("on updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const onUpdateRoom = await roomCaller.onUpdateRoom([newRoom.id]);
    const [data] = await Promise.all([
      onUpdateRoom[Symbol.asyncIterator]().next(),
      roomCaller.updateRoom({ id: newRoom.id, name: updatedName }),
    ]);

    assert(!data.done);

    expect(data.value.name).toBe(updatedName);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const deletedRoom = await roomCaller.deleteRoom(newRoom.id);

    expect(deletedRoom.id).toBe(newRoom.id);
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(roomCaller.deleteRoom(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Room, id).message}]`,
    );
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
    const [data] = await Promise.all([onDeleteRoom[Symbol.asyncIterator]().next(), roomCaller.deleteRoom(newRoom.id)]);

    assert(!data.done);

    expect(data.value).toBe(newRoom.id);
  });

  test("reads invite", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const readInvite = await roomCaller.readInvite(newInviteCode);

    assert(readInvite);

    expect(readInvite.userId).toBe(getMockSession().user.id);
    expect(readInvite.roomId).toBe(newRoom.id);
    expect(readInvite.code).toBe(newInviteCode);
    expect(readInvite.isMember).toBe(true);
  });

  test("reads non-existent invite", async () => {
    expect.hasAssertions();

    const readInvite = await roomCaller.readInvite(createCode(CODE_LENGTH));

    expect(readInvite).toBeNull();
  });

  test("fails read invite with invalid code", async () => {
    expect.hasAssertions();

    await expect(roomCaller.readInvite("")).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "origin": "string",
          "code": "too_small",
          "minimum": 8,
          "inclusive": true,
          "exact": true,
          "path": [],
          "message": "Too small: expected string to have >=8 characters"
        }
      ]]
    `);
  });

  test("reads invite code", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const readInviteCode = await roomCaller.readInviteCode({ roomId: newRoom.id });

    expect(readInviteCode).toBe(newInviteCode);
  });

  test("read invite code with no code to be null", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const readInviteCode = await roomCaller.readInviteCode({ roomId: newRoom.id });

    expect(readInviteCode).toBeNull();
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

  test("fails join with non-existent code", async () => {
    expect.hasAssertions();

    const code = createCode(CODE_LENGTH);

    await expect(roomCaller.joinRoom(code)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, code).message}]`,
    );
  });

  test("fails join with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await makeFriends(mainUser, user);
    const directMessageRoom = await directMessageCaller.createDirectMessage([user.id]);
    const inviteCode = await roomCaller.createInvite({ roomId: directMessageRoom.id });
    await mockSessionOnce(mockContext.db, user);

    await expect(roomCaller.joinRoom(inviteCode)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.UserToRoom, directMessageRoom.id).message}]`,
    );
  });

  test("fails create invite with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await makeFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(roomCaller.createInvite({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("fails read invite code with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await makeFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(roomCaller.readInviteCode({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("fails leave with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await makeFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(roomCaller.leaveRoom(directMessage.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("fails create members with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await makeFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(
      roomCaller.createMembers({ roomId: directMessage.id, userIds: [user.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("fails kick member with direct message room", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await makeFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(
      roomCaller.deleteMember({ roomId: directMessage.id, userId: user.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoom, directMessage.id).message}]`,
    );
  });

  test("reads rooms excluding direct messages", async () => {
    expect.hasAssertions();

    const mainUser = getMockSession().user;
    const newRoom = await roomCaller.createRoom({ name });
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await makeFriends(mainUser, user);
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
    await makeFriends(mainUser, user);
    const directMessage = await directMessageCaller.createDirectMessage([user.id]);

    await expect(roomCaller.readRooms({ roomId: directMessage.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, directMessage.id).message}]`,
    );
  });

  test("fails join with joined room", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });

    await expect(roomCaller.joinRoom(newInviteCode)).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Failed query: insert into "message"."users_to_rooms" ("isHidden", "notificationType", "roomId", "userId") values (default, default, $1, $2) returning "isHidden", "notificationType", "roomId", "userId"
      params: ${newRoom.id},${getMockSession().user.id}]
    `);
  });

  test("on joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const onJoinRoom = await roomCaller.onJoinRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db);
    const [data] = await Promise.all([onJoinRoom[Symbol.asyncIterator]().next(), roomCaller.joinRoom(newInviteCode)]);

    assert(!data.done);

    expect(data.value).toStrictEqual(session.user);
  });

  test("leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await mockSessionOnce(mockContext.db, user);
    const roomId = await roomCaller.leaveRoom(newRoom.id);

    expect(roomId).toStrictEqual(newRoom.id);
  });

  test("fails leave with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(roomCaller.leaveRoom(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Read, DatabaseEntityType.UserToRoom, id).message}]`,
    );
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
    const onLeaveRoom = await roomCaller.onLeaveRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db, user);
    const [data] = await Promise.all([onLeaveRoom[Symbol.asyncIterator]().next(), roomCaller.leaveRoom(newRoom.id)]);

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

    expect(takeOne(members.items).id).toBe(getMockSession().user.id);
  });

  test("reads members by ids", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const user = getMockSession().user;
    const members = await roomCaller.readMembersByIds({ ids: [user.id], roomId: newRoom.id });

    expect(takeOne(members).id).toBe(user.id);
  });

  test("fails read members by empty ids", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(roomCaller.readMembersByIds({ ids: [], roomId: newRoom.id })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "origin": "array",
          "code": "too_small",
          "minimum": 1,
          "inclusive": true,
          "path": [
            "ids"
          ],
          "message": "Too small: expected array to have >=1 items"
        }
      ]]
    `);
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

  test("creates members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const newMember = await roomCaller.createMembers({ roomId: newRoom.id, userIds: [user.id] });

    expect(newMember).toHaveLength(1);
    expect(takeOne(newMember).roomId).toBe(newRoom.id);
    expect(takeOne(newMember).userId).toBe(user.id);

    const members = await roomCaller.readMembers({ roomId: newRoom.id });

    expect(members.items).toHaveLength(2);
    expect(takeOne(members.items)).toStrictEqual(user);
    expect(takeOne(members.items, 1).id).toBe(userId);
  });

  test("fails create members with empty ids", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(roomCaller.createMembers({ roomId: newRoom.id, userIds: [] })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "origin": "array",
          "code": "too_small",
          "minimum": 1,
          "inclusive": true,
          "path": [
            "userIds"
          ],
          "message": "Too small: expected array to have >=1 items"
        }
      ]]
    `);
  });

  test("fails create members with non-creator", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { user } = await mockSessionOnce(mockContext.db);

    await expect(
      roomCaller.createMembers({ roomId: newRoom.id, userIds: [user.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails create members with duplicate membership", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(roomCaller.createMembers({ roomId: newRoom.id, userIds: [getMockSession().user.id] })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Failed query: insert into "message"."users_to_rooms" ("isHidden", "notificationType", "roomId", "userId") values (default, default, $1, $2) returning "isHidden", "notificationType", "roomId", "userId"
      params: ${newRoom.id},${getMockSession().user.id}]
    `);
  });

  test("fails create members with non-existent user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = crypto.randomUUID();

    await expect(roomCaller.createMembers({ roomId: newRoom.id, userIds: [userId] })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Failed query: insert into "message"."users_to_rooms" ("isHidden", "notificationType", "roomId", "userId") values (default, default, $1, $2) returning "isHidden", "notificationType", "roomId", "userId"
      params: ${newRoom.id},${userId}]
    `);
  });

  test("fails create members with non-existent room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(
      roomCaller.createMembers({ roomId, userIds: [getMockSession().user.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("kicks member with owner", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const invite = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(invite);

    await expect(roomCaller.deleteMember({ roomId: newRoom.id, userId: user.id })).resolves.toBeUndefined();

    const members = await roomCaller.readMembers({ roomId: newRoom.id });

    expect(members.items.find(({ id }) => id === user.id)).toBeUndefined();
  });

  test("fails kick with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const input: DeleteMemberInput = { roomId: newRoom.id, userId: crypto.randomUUID() };

    await expect(roomCaller.deleteMember(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, JSON.stringify(input)).message}]`,
    );
  });

  test("fails kick self with owner", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const input: DeleteMemberInput = { roomId: newRoom.id, userId: getMockSession().user.id };

    await expect(roomCaller.deleteMember(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, JSON.stringify(input)).message}]`,
    );
  });
});
