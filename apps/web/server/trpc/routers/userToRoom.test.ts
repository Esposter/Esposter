import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { createCallerFactory } from "#server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "#server/trpc/context.test";
import { createMentionMessage } from "#server/trpc/routers/createMentionMessage.test";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { messageRouter } from "#server/trpc/routers/message";
import { roleRouter } from "#server/trpc/routers/role";
import { roomRouter } from "#server/trpc/routers/room";
import { userToRoomRouter } from "#server/trpc/routers/userToRoom";
import { NotificationType, RoomPermission, roomsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("userToRoomRouter", () => {
  let mockContext: Context;
  let userToRoomCaller: DecorateRouterRecord<TRPCRouter["userToRoom"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";
  const displayName = "displayName";
  const position = 1;
  const timeZone = "UTC";
  // Creates a room as the owner plus a second member whose mention count the tests exercise.
  const setupMentionedMember = async () => {
    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);
    await messageCaller.createMessage({ message: createMentionMessage(member.id), roomId: newRoom.id, timeZone });
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
    roleCaller = createCallerFactory(roleRouter)(mockContext);
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

  test("fails readMyUsersToRooms for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      userToRoomCaller.readMyUsersToRooms({ roomIds: [newRoom.id] }),
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

  // A targeted write is a display name and nothing else: the input rule refuses a target with any other setting, so a
  // Holder of the permission cannot move another member's notifications or read marker through the same path
  test("refuses a targeted update that sets anything but a display name", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const member = await createRoomMember(mockContext, newRoom.id);

    await expect(
      userToRoomCaller.updateUserToRoom({
        notificationType: NotificationType.Never,
        roomId: newRoom.id,
        targetUserId: member.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "code": "custom",
          "path": [],
          "message": "targetUserId requires displayName and must not include notificationType or lastReadAt"
        }
      ]]
    `);
  });

  test("a moderator's targeted update returns the renamed member's row", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const moderator = await createRoomMember(mockContext, newRoom.id);
    const member = await createRoomMember(mockContext, newRoom.id);
    const role = await roleCaller.createRole({
      name,
      permissions: RoomPermission.ManageDisplayNames,
      position,
      roomId: newRoom.id,
    });
    await roleCaller.assignRole({ roleId: role.id, roomId: newRoom.id, userId: moderator.id });
    await mockSessionOnce(mockContext.db, moderator);
    const updatedUserToRoom = await userToRoomCaller.updateUserToRoom({
      displayName,
      roomId: newRoom.id,
      targetUserId: member.id,
    });

    expect(updatedUserToRoom).toMatchObject({ displayName, roomId: newRoom.id, userId: member.id });
  });

  // The slowmode clock is what the next send is checked against, so a client able to write it could reset its own
  // Slowmode — marking a room unread moves the read marker and must leave the clock where the last send put it
  test("keeps the slowmode clock out of a client update", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await messageCaller.createMessage({ message: name, roomId: newRoom.id, timeZone });
    const { lastMessageAt } = takeOne(await userToRoomCaller.readMyUsersToRooms({ roomIds: [newRoom.id] }));
    const lastReadAt = new Date(0);
    // A variable rather than a literal, so the stray key reaches the schema the way a hand-built request would
    const input = { lastMessageAt: lastReadAt, lastReadAt, roomId: newRoom.id };
    const updatedUserToRoom = await userToRoomCaller.updateUserToRoom(input);

    expect(lastMessageAt).not.toBeNull();
    expect(updatedUserToRoom.lastMessageAt).toStrictEqual(lastMessageAt);
    expect(updatedUserToRoom.lastReadAt).toStrictEqual(lastReadAt);
  });
});
