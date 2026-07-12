import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { incrementMentionCounts } from "@/services/message/incrementMentionCounts";
import { createMockDb } from "@esposter/db-mock";
import {
  NotificationType,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  users,
  UserStatus,
  userStatusesInMessage,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import {
  MENTION_EVERYONE_ID,
  MENTION_HERE_ID,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
  MentionType,
} from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

const getMentionMessage = (id: string, type?: MentionType) =>
  `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${id}"${type ? ` ${MENTION_ITEM_TYPE_ATTRIBUTE}="${type}"` : ""} />`;

const getMentionedUserIds = (updatedUsersToRooms: { userId: string }[]) =>
  new Set(updatedUsersToRooms.map(({ userId }) => userId));

describe(incrementMentionCounts, () => {
  let db: PostgresJsDatabase<typeof relations>;
  const name = "name";
  const roomId = crypto.randomUUID();
  const roleId = crypto.randomUUID();
  const onlineUserId = crypto.randomUUID();
  const offlineUserId = crypto.randomUUID();
  const nullStatusUserId = crypto.randomUUID();
  const neverUserId = crypto.randomUUID();
  const roleMemberUserId = crypto.randomUUID();
  const senderUserId = crypto.randomUUID();
  const sender = { partitionKey: roomId, userId: senderUserId };

  beforeAll(async () => {
    db = await createMockDb();
    const createdAt = new Date();
    const createUser = (id: string) => ({
      createdAt,
      email: id,
      emailVerified: true,
      id,
      image: "",
      name,
      updatedAt: createdAt,
    });

    await db
      .insert(users)
      .values(
        [onlineUserId, offlineUserId, nullStatusUserId, neverUserId, roleMemberUserId, senderUserId].map((id) =>
          createUser(id),
        ),
      );

    await db.insert(roomsInMessage).values({
      id: roomId,
      name,
      type: RoomType.Room,
      userId: onlineUserId,
    });

    await db.insert(usersToRoomsInMessage).values([
      { notificationType: NotificationType.DirectMessage, roomId, userId: onlineUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: offlineUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: nullStatusUserId },
      { notificationType: NotificationType.Never, roomId, userId: neverUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: roleMemberUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: senderUserId },
    ]);

    await db.insert(roomRolesInMessage).values({ id: roleId, name, roomId });
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
      // NullStatusUserId intentionally has no status row (null status = treated as online for @here)
    ]);
  });

  afterEach(async () => {
    await db.update(usersToRoomsInMessage).set({ mentionCount: 0 }).where(eq(usersToRoomsInMessage.roomId, roomId));
  });

  afterAll(async () => {
    await db.delete(users);
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
      message: getMentionMessage(neverUserId, MentionType.User),
    });

    expect(updatedUsersToRooms).toHaveLength(1);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(new Set([neverUserId]));
    expect(updatedUsersToRooms.every(({ mentionCount }) => mentionCount === 1)).toBe(true);
  });

  test("mentioning only the sender updates nobody", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      ...sender,
      message: getMentionMessage(senderUserId, MentionType.User),
    });

    expect(updatedUsersToRooms).toHaveLength(0);
  });

  test("@everyone increments all members excluding Never and sender", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      ...sender,
      message: getMentionMessage(MENTION_EVERYONE_ID),
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
      message: getMentionMessage(MENTION_HERE_ID),
    });

    expect(updatedUsersToRooms).toHaveLength(3);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(
      new Set([nullStatusUserId, onlineUserId, roleMemberUserId]),
    );
  });

  test("role mention increments role members excluding sender", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      ...sender,
      message: getMentionMessage(roleId, MentionType.Role),
    });

    expect(updatedUsersToRooms).toHaveLength(1);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(new Set([roleMemberUserId]));
  });

  test("multiple mentions of the same member increment once per message", async () => {
    expect.hasAssertions();

    const message = `${getMentionMessage(onlineUserId, MentionType.User)}${getMentionMessage(MENTION_EVERYONE_ID)}`;
    const updatedUsersToRooms = await incrementMentionCounts(db, { ...sender, message });
    const mentionedOnlineUser = updatedUsersToRooms.find(({ userId }) => userId === onlineUserId);

    expect(mentionedOnlineUser?.mentionCount).toBe(1);
  });

  test("no userId increments every mentioned member without excluding a sender (webhook message)", async () => {
    expect.hasAssertions();

    const updatedUsersToRooms = await incrementMentionCounts(db, {
      message: getMentionMessage(senderUserId, MentionType.User),
      partitionKey: roomId,
    });

    expect(updatedUsersToRooms).toHaveLength(1);
    expect(getMentionedUserIds(updatedUsersToRooms)).toStrictEqual(new Set([senderUserId]));
  });
});
