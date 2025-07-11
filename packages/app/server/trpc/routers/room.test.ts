import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { rooms } from "#shared/db/schema/rooms";
import { CODE_LENGTH } from "#shared/services/invite/constants";
import { createCode } from "#shared/util/math/random/createCode";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { NIL } from "@esposter/shared";
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

  test("reads empty rooms", async () => {
    expect.hasAssertions();

    const readRooms = await caller.readRooms();

    expect(readRooms).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("fails read with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.readRoom(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails read with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(caller.readRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: ${newRoom.id}]`,
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

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.updateRoom({ id: NIL, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Room, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(caller.updateRoom({ id: newRoom.id, name })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Room, ${newRoom.id}]`,
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

    await expect(caller.deleteRoom(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Room, 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("fails delete with wrong user", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(caller.deleteRoom(newRoom.id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Room, ${newRoom.id}]`,
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
      `[TRPCError: Invite is not found for id: ${code}]`,
    );
  });

  test("fails join with joined room", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const newInviteCode = await caller.createInvite({ roomId: newRoom.id });

    await expect(caller.joinRoom(newInviteCode)).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Failed query: insert into "users_to_rooms" ("roomId", "userId") values ($1, $2) returning "roomId", "userId"
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

    expect(data.value).toStrictEqual({ roomId: newRoom.id, sessionId: session.session.id, user: session.user });
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

    await expect(caller.leaveRoom(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: UserToRoom, "00000000-0000-0000-0000-000000000000"]`,
    );
  });

  test("leaves with creator to be deleted", async () => {
    expect.hasAssertions();

    const newRoom = await caller.createRoom({ name });
    const roomId = await caller.leaveRoom(newRoom.id);

    await expect(caller.readRoom(roomId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: ${roomId}]`,
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

    expect(data.value).toStrictEqual({ roomId: newRoom.id, sessionId: session.session.id, userId: session.user.id });
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
});
