import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { NotificationType, roomsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("userToRoom", () => {
  let mockContext: Context;
  let userToRoomCaller: DecorateRouterRecord<TRPCRouter["userToRoom"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    userToRoomCaller = createCallerFactory(userToRoomRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(usersToRoomsInMessage);
    await mockContext.db.delete(roomsInMessage);
  });

  test("reads own full record", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const myUsersToRooms = await userToRoomCaller.readMyUsersToRooms({ roomIds: [newRoom.id] });
    const userId = getMockSession().user.id;
    const userToRoom = takeOne(myUsersToRooms);

    expect(myUsersToRooms).toHaveLength(1);
    expect(userToRoom.roomId).toBe(newRoom.id);
    expect(userToRoom.userId).toBe(userId);
    expect(userToRoom.notificationType).toBe(NotificationType.DirectMessage);
  });

  test("reads only own record, not other members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const myUsersToRooms = await userToRoomCaller.readMyUsersToRooms({ roomIds: [newRoom.id] });
    const userId = getMockSession().user.id;

    expect(myUsersToRooms.every((userToRoom) => userToRoom.userId === userId)).toBe(true);
  });

  test("reads nicknames for members", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    const nicknames = await userToRoomCaller.readNicknames({ roomId: newRoom.id, userIds: [userId] });
    const nicknameEntry = takeOne(nicknames);

    expect(nicknames).toHaveLength(1);
    expect(nicknameEntry.userId).toBe(userId);
    expect(nicknameEntry.roomId).toBe(newRoom.id);
    expect(nicknameEntry.nickname).toBe("");
  });

  test("fails readMyUsersToRooms for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      userToRoomCaller.readMyUsersToRooms({ roomIds: [newRoom.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails readNicknames for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const userId = getMockSession().user.id;
    await mockSessionOnce(mockContext.db);

    await expect(
      userToRoomCaller.readNicknames({ roomId: newRoom.id, userIds: [userId] }),
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
});
