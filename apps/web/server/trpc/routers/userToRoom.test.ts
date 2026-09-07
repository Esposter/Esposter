import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { createMentionMessage } from "@@/server/trpc/routers/createMentionMessage.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { roomRouter } from "@@/server/trpc/routers/room";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { NotificationType, roomsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("userToRoomRouter", () => {
  let mockContext: Context;
  let userToRoomCaller: DecorateRouterRecord<TRPCRouter["userToRoom"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";
  // Creates a room as the owner plus a second member whose mention count the tests exercise.
  const setupMentionedMember = async () => {
    const newRoom = await roomCaller.createRoom({ name });
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: newRoom.id });
    const { user: member } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    await messageCaller.createMessage({ message: createMentionMessage(member.id), roomId: newRoom.id });
    return { member, roomId: newRoom.id };
  };
  const readMemberMentionCount = async (member: User, roomId: string) => {
    await mockSessionOnce(mockContext.db, member);
    const myUsersToRooms = await userToRoomCaller.readMyUsersToRooms({ roomIds: [roomId] });
    return takeOne(myUsersToRooms).mentionCount;
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    userToRoomCaller = createCallerFactory(userToRoomRouter)(mockContext);
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    MockTableDatabase.clear();
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

  test("createMessage increments mentionCount for mentioned member", async () => {
    expect.hasAssertions();

    const { member, roomId } = await setupMentionedMember();
    const mentionCount = await readMemberMentionCount(member, roomId);

    expect(mentionCount).toBe(1);
  });

  test("clearMentionCount is idempotent", async () => {
    expect.hasAssertions();

    const { member, roomId } = await setupMentionedMember();
    await mockSessionOnce(mockContext.db, member);
    await userToRoomCaller.clearMentionCount({ roomId });
    await mockSessionOnce(mockContext.db, member);
    await userToRoomCaller.clearMentionCount({ roomId });
    const mentionCount = await readMemberMentionCount(member, roomId);

    expect(mentionCount).toBe(0);
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
