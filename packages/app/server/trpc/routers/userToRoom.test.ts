import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { NotificationType, rooms, usersToRooms } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("userToRoom", () => {
  let userToRoomCaller: DecorateRouterRecord<TRPCRouter["userToRoom"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;
  const name = "name";

  beforeAll(async () => {
    const createUserToRoomCaller = createCallerFactory(userToRoomRouter);
    const createRoomCaller = createCallerFactory(roomRouter);
    mockContext = await createMockContext();
    userToRoomCaller = createUserToRoomCaller(mockContext);
    roomCaller = createRoomCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(usersToRooms);
    await mockContext.db.delete(rooms);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const readUserToRooms = await userToRoomCaller.readUserToRooms({ roomIds: [newRoom.id] });

    expect(readUserToRooms).toHaveLength(1);
    expect(readUserToRooms[0].roomId).toBe(newRoom.id);
    expect(readUserToRooms[0].userId).toBe(getMockSession().user.id);
    expect(readUserToRooms[0].notificationType).toBe(NotificationType.DirectMessage);
  });

  test("fails read for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      userToRoomCaller.readUserToRooms({ roomIds: [newRoom.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("updates notificationType", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const updatedUserToRoom = await userToRoomCaller.updateUserToRoom({
      notificationType: NotificationType.Never,
      roomId: newRoom.id,
    });

    expect(updatedUserToRoom.notificationType).toBe(NotificationType.Never);
  });

  test("fails update for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      userToRoomCaller.updateUserToRoom({ notificationType: NotificationType.DirectMessage, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
