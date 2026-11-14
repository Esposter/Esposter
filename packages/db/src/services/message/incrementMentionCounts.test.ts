import type { MockDatabase } from "@esposter/db-mock";
import type { Database } from "@esposter/db-schema";

import { createMention } from "#src/services/message/createMention.test";
import { createUser } from "#src/services/message/createUser.test";
import { incrementMentionCounts } from "#src/services/message/incrementMentionCounts";
import { createMockDb } from "@esposter/db-mock";
import {
  NotificationType,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  usersInAuth,
  UserStatus,
  userStatusesInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { MENTION_EVERYONE_ID, MENTION_HERE_ID, MentionType } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

const getMentionedUserIds = (updatedUsersToRooms: { userId: string }[]) =>
  new Set(updatedUsersToRooms.map(({ userId }) => userId));

describe(incrementMentionCounts, () => {
  let db: Database;
  let mockDatabase: MockDatabase;
  const name = "name";
  const roomId = v7();
  const roleId = v7();
  const onlineUserId = v7();
  const offlineUserId = v7();
  const nullStatusUserId = v7();
  const neverUserId = v7();
  const roleMemberUserId = v7();
  const senderUserId = v7();
  const sender = { roomId, userId: senderUserId };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
    const createdAt = new Date(0);
    await db
      .insert(usersInAuth)
      .values(
        [onlineUserId, offlineUserId, nullStatusUserId, neverUserId, roleMemberUserId, senderUserId].map((id) =>
          createUser(id, createdAt, name),
        ),
      );

    await db.insert(roomsInMessage).values({ id: roomId, name, type: RoomType.Room, userId: onlineUserId });

    await db.insert(usersToRoomsInMessage).values([
      { notificationType: NotificationType.DirectMessage, roomId, userId: onlineUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: offlineUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: nullStatusUserId },
      { notificationType: NotificationType.Never, roomId, userId: neverUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: roleMemberUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: senderUserId },
    ]);

    // The sender holds this role, so its broadcasts are theirs to make
    await db
      .insert(roomRolesInMessage)
      .values({ id: roleId, name, permissions: RoomPermission.MentionEveryone, roomId });
    await db.insert(usersToRoomRolesInMessage).values([
      { roleId, roomId, userId: roleMemberUserId },
      { roleId, roomId, userId: senderUserId },
    ]);

    await db.insert(userStatusesInMessage).values([
      { status: UserStatus.Online, userId: onlineUserId },
      { status: UserStatus.Offline, userId: offlineUserId },
      { status: UserStatus.Online, userId: neverUserId },
      { status: UserStatus.Online, userId: roleMemberUserId },
      { status: UserStatus.Online, userId: senderUserId },
      // The null-status user has no status row on purpose: a null status counts as online for @here
    ]);
  });

  afterEach(async () => {
    await db.update(usersToRoomsInMessage).set({ mentionCount: 0 }).where(eq(usersToRoomsInMessage.roomId, roomId));
  });

  afterAll(async () => {
    await db.delete(usersInAuth);
    await db.delete(roomsInMessage);
  });

  test("no mention updates nobody", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, { ...sender, message: "" });

    expect(updatedUsersToRooms).toHaveLength(0);
  });

  test("regular mention increments the mentioned member regardless of notification preference", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      ...sender,
      message: createMention(neverUserId, MentionType.User),
    });

    expect(updatedUsersToRooms).toHaveLength(1);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(new Set([neverUserId]));
    expect(updatedUsersToRooms.map(({ mentionCount }) => mentionCount)).toStrictEqual([1]);
  });

  test("mentioning only the sender updates nobody", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      ...sender,
      message: createMention(senderUserId, MentionType.User),
    });

    expect(updatedUsersToRooms).toHaveLength(0);
  });

  test("@everyone increments all members excluding Never and sender", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      ...sender,
      message: createMention(MENTION_EVERYONE_ID),
    });

    expect(updatedUsersToRooms).toHaveLength(4);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(
      new Set([nullStatusUserId, offlineUserId, onlineUserId, roleMemberUserId]),
    );
  });

  test("@here increments online and no-status members excluding offline, Never and sender", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      ...sender,
      message: createMention(MENTION_HERE_ID),
    });

    expect(updatedUsersToRooms).toHaveLength(3);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(
      new Set([nullStatusUserId, onlineUserId, roleMemberUserId]),
    );
  });

  test("@everyone from a sender without MentionEveryone increments nobody", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      message: createMention(MENTION_EVERYONE_ID),
      roomId,
      userId: neverUserId,
    });

    expect(updatedUsersToRooms).toHaveLength(0);
  });

  test("role mention increments role members excluding sender", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      ...sender,
      message: createMention(roleId, MentionType.Role),
    });

    expect(updatedUsersToRooms).toHaveLength(1);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(new Set([roleMemberUserId]));
  });

  test("multiple mentions of the same member increment once per message", async () => {
    expect.hasAssertions();

    const message = `${createMention(onlineUserId, MentionType.User)}${createMention(MENTION_EVERYONE_ID)}`;
    const updatedUsersToRooms = await incrementMentionCounts(db, { ...sender, message });
    const mentionedOnlineUser = updatedUsersToRooms.find(({ userId }) => userId === onlineUserId);

    expect(mentionedOnlineUser?.mentionCount).toBe(1);
  });

  test("a null userId increments every mentioned member without excluding a sender (webhook message)", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      message: createMention(senderUserId, MentionType.User),
      roomId,
      userId: null,
    });

    expect(updatedUsersToRooms).toHaveLength(1);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(new Set([senderUserId]));
  });
});
