import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { rooms } from "#shared/db/schema/rooms";
import { CODE_LENGTH } from "#shared/services/invite/constants";
import { createCode } from "#shared/util/math/random/createCode";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockUserOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { NIL } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("room", () => {
  let caller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;

  beforeAll(async () => {
    const createCaller = createCallerFactory(roomRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });

    expect(newRoom.name).toBe(name);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const readRoom = await caller.readRoom(newRoom.id);

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("fails read with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.readRoom(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("reads latest updated room", async () => {
    expect.hasAssertions();

    const name = "name";
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

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const updatedName = "updatedName";
    const updatedRoom = await caller.updateRoom({ id: newRoom.id, name: updatedName });

    expect(updatedRoom.name).toBe(updatedName);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.updateRoom({ id: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: No values to set]`,
    );
  });

  test("on updates", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const updatedName = "updatedName";
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

    const name = "name";
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

  test("on deletes", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const onDeleteRoom = await caller.onDeleteRoom([newRoom.id]);
    const [data] = await Promise.all([onDeleteRoom[Symbol.asyncIterator]().next(), caller.deleteRoom(newRoom.id)]);

    assert(!data.done);

    expect(data.value).toBe(newRoom.id);
  });

  test("reads invite code", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const inviteCode = await caller.createInvite({ roomId: newRoom.id });
    const readInviteCode = await caller.readInviteCode({ roomId: newRoom.id });

    expect(readInviteCode).toStrictEqual(inviteCode);
  });

  test("read invite code with no code to be null", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const readInviteCode = await caller.readInviteCode({ roomId: newRoom.id });

    expect(readInviteCode).toBeNull();
  });

  test("creates invite to be cached", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const inviteCode = await caller.createInvite({ roomId: newRoom.id });
    const cachedInviteCode = await caller.createInvite({ roomId: newRoom.id });

    expect(cachedInviteCode).toStrictEqual(inviteCode);
  });

  test("joins", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const inviteCode = await caller.createInvite({ roomId: newRoom.id });
    await mockUserOnce(mockContext.db);
    const joinedRoom = await caller.joinRoom(inviteCode);

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

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const inviteCode = await caller.createInvite({ roomId: newRoom.id });

    await expect(caller.joinRoom(inviteCode)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: duplicate key value violates unique constraint "users_to_rooms_userId_roomId_pk"]`,
    );
  });

  test("on joins", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const inviteCode = await caller.createInvite({ roomId: newRoom.id });
    const onJoinRoom = await caller.onJoinRoom([newRoom.id]);
    const user = await mockUserOnce(mockContext.db);
    const [data] = await Promise.all([onJoinRoom[Symbol.asyncIterator]().next(), caller.joinRoom(inviteCode)]);

    assert(!data.done);

    expect(data.value).toStrictEqual({ roomId: newRoom.id, user });
  });

  test("leaves", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const inviteCode = await caller.createInvite({ roomId: newRoom.id });
    const user = await mockUserOnce(mockContext.db);
    await caller.joinRoom(inviteCode);
    await mockUserOnce(mockContext.db, user);
    const roomId = await caller.leaveRoom(newRoom.id);

    expect(roomId).toStrictEqual(newRoom.id);
  });

  test("fails leave with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.leaveRoom(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: UserToRoom, {"roomId":"00000000-0000-0000-0000-000000000000","userId":"00000000-0000-0000-0000-000000000000"}]`,
    );
  });

  test("leaves with creator to be delete", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const roomId = await caller.leaveRoom(newRoom.id);

    await expect(caller.readRoom(roomId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: ${roomId}]`,
    );
  });

  test("on leaves", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const inviteCode = await caller.createInvite({ roomId: newRoom.id });
    const user = await mockUserOnce(mockContext.db);
    await caller.joinRoom(inviteCode);
    const onLeaveRoom = await caller.onLeaveRoom([newRoom.id]);
    await mockUserOnce(mockContext.db, user);
    const [data] = await Promise.all([onLeaveRoom[Symbol.asyncIterator]().next(), caller.leaveRoom(newRoom.id)]);

    assert(!data.done);

    expect(data.value).toStrictEqual({ roomId: newRoom.id, userId: user.id });
  });

  test("reads members", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const members = await caller.readMembers({ roomId: newRoom.id });
    const user = getMockSession().user;

    expect(members.items[0]).toStrictEqual(user);
  });

  test("reads members by ids", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const user = getMockSession().user;
    const members = await caller.readMembersByIds({ ids: [user.id], roomId: newRoom.id });

    expect(members[0]).toStrictEqual(user);
  });
});
