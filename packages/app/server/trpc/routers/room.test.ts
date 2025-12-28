import type { DeleteMemberInput } from "#shared/models/db/room/DeleteMemberInput";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCode } from "#shared/util/math/random/createCode";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { CODE_LENGTH, DatabaseEntityType, rooms } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("room", () => {
  let caller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;
  const name = "name";
  const updatedName = "updatedName";

  beforeAll(async () => {
    const createCaller = createCallerFactory(roomRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(rooms);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });

    expect(newRoom.name).toBe(name);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const readRoom = await caller.readRoom(newRoom.id);

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("fails read with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(caller.readRoom(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, id).message}]`,
    );
  });

  test("fails read with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(caller.readRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  test("reads empty rooms", async () => {
    expect.hasAssertions();

    const readRooms = await caller.readRooms();

    expect(readRooms).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("reads multiple with roomId with inclusive filter", async () => {
    expect.hasAssertions();

    const newRoom1 = await caller.createRoom({ name: `${name}1` });
    await caller.createRoom({ name: `${name}2` });
    const readRooms = await caller.readRooms({ filter: { name: "1" }, roomId: newRoom1.id });

    expect(readRooms.items).toHaveLength(1);
    expect(readRooms.items[0]).toStrictEqual(newRoom1);
  });

  test("reads multiple with roomId with exclusive filter", async () => {
    expect.hasAssertions();

    const newRoom1 = await caller.createRoom({ name: `${name}1` });
    const newRoom2 = await caller.createRoom({ name: `${name}2` });
    const readRooms = await caller.readRooms({ filter: { name: "2" }, roomId: newRoom1.id });

    expect(readRooms.items).toHaveLength(2);
    expect(readRooms.items[0]).toStrictEqual(newRoom2);
    expect(readRooms.items[1]).toStrictEqual(newRoom1);
  });

  test("fails read multiple with non-existent room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(caller.readRooms({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails read multiple with room not joined", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(caller.readRooms({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("reads latest updated room", async () => {
    expect.hasAssertions();

    await caller.createRoom({ name });
    const newRoom = await caller.createRoom({ name });
    const readRoom = await caller.readRoom();

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("reads latest updated room with no rooms to be null", async () => {
    expect.hasAssertions();

    const readRoom = await caller.readRoom();

    expect(readRoom).toBeNull();
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const updatedRoom = await caller.updateRoom({ id: newRoom.id, name: updatedName });

    expect(updatedRoom.name).toBe(updatedName);
  });

  test("trims name on update", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const updatedRoom = await caller.updateRoom({ id: newRoom.id, name: ` ${updatedName} ` });

    expect(updatedRoom.name).toBe(updatedName);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(caller.updateRoom({ id, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Room, id).message}]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(caller.updateRoom({ id: newRoom.id, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  test("on updates", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const onUpdateRoom = await caller.onUpdateRoom([newRoom.id]);
    const [data] = await Promise.all([
      onUpdateRoom[Symbol.asyncIterator]().next(),
      caller.updateRoom({ id: newRoom.id, name: updatedName }),
    ]);

    assert(!data.done);

    expect(data.value.name).toBe(updatedName);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const deletedRoom = await caller.deleteRoom(newRoom.id);

    expect(deletedRoom.id).toBe(newRoom.id);
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(caller.deleteRoom(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Room, id).message}]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(caller.deleteRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.Room, newRoom.id).message}]`,
    );
  });

  test("on deletes", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const onDeleteRoom = await caller.onDeleteRoom([newRoom.id]);
    const [data] = await Promise.all([onDeleteRoom[Symbol.asyncIterator]().next(), caller.deleteRoom(newRoom.id)]);

    assert(!data.done);

    expect(data.value).toBe(newRoom.id);
  });

  test("reads invite", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });
    const readInvite = await caller.readInvite(newInviteCode);

    assert(readInvite);

    expect(readInvite.userId).toBe(getMockSession().user.id);
    expect(readInvite.roomId).toBe(newRoom.id);
    expect(readInvite.code).toBe(newInviteCode);
    expect(readInvite.isMember).toBe(true);
  });

  test("reads non-existent invite", async () => {
    expect.hasAssertions();

    const readInvite = await caller.readInvite(createCode(CODE_LENGTH));

    expect(readInvite).toBeNull();
  });

  test("fails read invite with invalid code", async () => {
    expect.hasAssertions();

    await expect(caller.readInvite("")).rejects.toThrowErrorMatchingInlineSnapshot(`
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

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });
    const readInviteCode = await caller.readInviteCode({ roomId: newRoom.id });

    expect(readInviteCode).toBe(newInviteCode);
  });

  test("read invite code with no code to be null", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const readInviteCode = await caller.readInviteCode({ roomId: newRoom.id });

    expect(readInviteCode).toBeNull();
  });

  test("creates invite to be cached", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });
    const cachedInviteCode = await caller.createInvite({ roomId: newRoom.id });

    expect(cachedInviteCode).toBe(newInviteCode);
  });

  test("joins", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });
    await mockSessionOnce(mockContext.db);
    const joinedRoom = await caller.joinRoom(newInviteCode);

    expect(joinedRoom).toStrictEqual(newRoom);
  });

  test("fails join with non-existent code", async () => {
    expect.hasAssertions();

    const code = createCode(CODE_LENGTH);

    await expect(caller.joinRoom(code)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Invite, code).message}]`,
    );
  });

  test("fails join with joined room", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });

    await expect(caller.joinRoom(newInviteCode)).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Failed query: insert into "message"."users_to_rooms" ("notificationType", "roomId", "userId") values (default, $1, $2) returning "notificationType", "roomId", "userId"
      params: ${newRoom.id},${getMockSession().user.id}]
    `);
  });

  test("on joins", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });
    const onJoinRoom = await caller.onJoinRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db);
    const [data] = await Promise.all([onJoinRoom[Symbol.asyncIterator]().next(), caller.joinRoom(newInviteCode)]);

    assert(!data.done);

    expect(data.value).toStrictEqual(session.user);
  });

  test("leaves", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await caller.joinRoom(newInviteCode);
    await mockSessionOnce(mockContext.db, user);
    const roomId = await caller.leaveRoom(newRoom.id);

    expect(roomId).toStrictEqual(newRoom.id);
  });

  test("fails leave with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(caller.leaveRoom(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, id).message}]`,
    );
  });

  test("leaves with creator to be deleted", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const roomId = await caller.leaveRoom(newRoom.id);

    await expect(caller.readRoom(roomId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Room, roomId).message}]`,
    );
  });

  test("on leaves", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await caller.joinRoom(newInviteCode);
    const onLeaveRoom = await caller.onLeaveRoom([newRoom.id]);
    const session = await mockSessionOnce(mockContext.db, user);
    const [data] = await Promise.all([onLeaveRoom[Symbol.asyncIterator]().next(), caller.leaveRoom(newRoom.id)]);

    assert(!data.done);

    expect(data.value).toBe(session.user.id);
  });

  test("counts members", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newCount = await caller.countMembers({ roomId: newRoom.id });

    expect(newCount).toBe(1);
  });

  test("reads members", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const members = await caller.readMembers({ roomId: newRoom.id });
    const user = getMockSession().user;

    expect(members.items[0]).toStrictEqual(user);
  });

  test("reads members by ids", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const user = getMockSession().user;
    const members = await caller.readMembersByIds({ ids: [user.id], roomId: newRoom.id });

    expect(members[0]).toStrictEqual(user);
  });

  test("fails read members by empty ids", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });

    await expect(caller.readMembersByIds({ ids: [], roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(`
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

    const newRoom = await caller.createRoom({ name });
    const userId = getMockSession().user.id;
    await mockSessionOnce(mockContext.db);

    await expect(
      caller.readMembersByIds({ ids: [userId], roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("creates members", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const userId = getMockSession().user.id;
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    const newMember = await caller.createMembers({ roomId: newRoom.id, userIds: [user.id] });

    expect(newMember).toHaveLength(1);
    expect(newMember[0].roomId).toBe(newRoom.id);
    expect(newMember[0].userId).toBe(user.id);

    const members = await caller.readMembers({ roomId: newRoom.id });

    expect(members.items).toHaveLength(2);
    expect(members.items[0]).toStrictEqual(user);
    expect(members.items[1].id).toBe(userId);
  });

  test("fails create members with empty ids", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });

    await expect(caller.createMembers({ roomId: newRoom.id, userIds: [] })).rejects.toThrowErrorMatchingInlineSnapshot(`
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

    const newRoom = await caller.createRoom({ name });
    const { user } = await mockSessionOnce(mockContext.db);

    await expect(
      caller.createMembers({ roomId: newRoom.id, userIds: [user.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails create members with duplicate membership", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });

    await expect(caller.createMembers({ roomId: newRoom.id, userIds: [getMockSession().user.id] })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Failed query: insert into "message"."users_to_rooms" ("notificationType", "roomId", "userId") values (default, $1, $2) returning "notificationType", "roomId", "userId"
      params: ${newRoom.id},${getMockSession().user.id}]
    `);
  });

  test("fails create members with non-existent user", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const userId = crypto.randomUUID();

    await expect(caller.createMembers({ roomId: newRoom.id, userIds: [userId] })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Failed query: insert into "message"."users_to_rooms" ("notificationType", "roomId", "userId") values (default, $1, $2) returning "notificationType", "roomId", "userId"
      params: ${newRoom.id},${userId}]
    `);
  });

  test("fails create members with non-existent room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await expect(
      caller.createMembers({ roomId, userIds: [getMockSession().user.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("kicks member with owner", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const invite = await caller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await caller.joinRoom(invite);

    await expect(caller.deleteMember({ roomId: newRoom.id, userId: user.id })).resolves.toBeUndefined();

    const members = await caller.readMembers({ roomId: newRoom.id });

    expect(members.items.find(({ id }) => id === user.id)).toBeUndefined();
  });

  test("fails kick with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const input: DeleteMemberInput = { roomId: newRoom.id, userId: crypto.randomUUID() };

    await expect(caller.deleteMember(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, JSON.stringify(input)).message}]`,
    );
  });

  test("fails kick self with owner", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const input: DeleteMemberInput = { roomId: newRoom.id, userId: getMockSession().user.id };

    await expect(caller.deleteMember(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.UserToRoom, JSON.stringify(input)).message}]`,
    );
  });
});
