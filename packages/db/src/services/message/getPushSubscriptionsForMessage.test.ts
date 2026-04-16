import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getPushSubscriptionsForMessage } from "@/services/message/getPushSubscriptionsForMessage";
import { createMockDb } from "@/test/createMockDb";
import {
  NotificationType,
  pushSubscriptions,
  rooms,
  RoomType,
  schema,
  users,
  UserStatus,
  userStatuses,
  usersToRooms,
} from "@esposter/db-schema";
import {
  MENTION_EVERYONE_ID,
  MENTION_HERE_ID,
  MENTION_ID_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
} from "@esposter/shared";
import { beforeAll, describe, expect, test } from "vitest";

const getEndpoint = (userId: string) => `https://push.example.com/${userId}`;

describe(getPushSubscriptionsForMessage, () => {
  let db: PostgresJsDatabase<typeof schema>;
  const roomId = crypto.randomUUID();
  const allOnlineUserId = crypto.randomUUID();
  const allOfflineUserId = crypto.randomUUID();
  const allNullStatusUserId = crypto.randomUUID();
  const directMessageOnlineUserId = crypto.randomUUID();
  const directMessageOfflineUserId = crypto.randomUUID();
  const neverUserId = crypto.randomUUID();
  const senderUserId = crypto.randomUUID();
  const getMentionMessage = (id: string) =>
    `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${id}" />`;

  beforeAll(async () => {
    db = await createMockDb();
    const createdAt = new Date();
    const makeUser = (id: string) => ({
      createdAt,
      email: id,
      emailVerified: true,
      id,
      image: null,
      name: id,
      updatedAt: createdAt,
    });

    await db
      .insert(users)
      .values([
        makeUser(allOnlineUserId),
        makeUser(allOfflineUserId),
        makeUser(allNullStatusUserId),
        makeUser(directMessageOnlineUserId),
        makeUser(directMessageOfflineUserId),
        makeUser(neverUserId),
        makeUser(senderUserId),
      ]);

    await db.insert(rooms).values({
      id: roomId,
      name: "",
      type: RoomType.Room,
      userId: allOnlineUserId,
    });

    await db.insert(usersToRooms).values([
      { notificationType: NotificationType.All, roomId, userId: allOnlineUserId },
      { notificationType: NotificationType.All, roomId, userId: allOfflineUserId },
      { notificationType: NotificationType.All, roomId, userId: allNullStatusUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: directMessageOnlineUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: directMessageOfflineUserId },
      { notificationType: NotificationType.Never, roomId, userId: neverUserId },
      { notificationType: NotificationType.All, roomId, userId: senderUserId },
    ]);

    await db.insert(pushSubscriptions).values([
      { auth: "", endpoint: getEndpoint(allOnlineUserId), p256dh: "", userId: allOnlineUserId },
      { auth: "", endpoint: getEndpoint(allOfflineUserId), p256dh: "", userId: allOfflineUserId },
      { auth: "", endpoint: getEndpoint(allNullStatusUserId), p256dh: "", userId: allNullStatusUserId },
      { auth: "", endpoint: getEndpoint(directMessageOnlineUserId), p256dh: "", userId: directMessageOnlineUserId },
      { auth: "", endpoint: getEndpoint(directMessageOfflineUserId), p256dh: "", userId: directMessageOfflineUserId },
      { auth: "", endpoint: getEndpoint(neverUserId), p256dh: "", userId: neverUserId },
      { auth: "", endpoint: getEndpoint(senderUserId), p256dh: "", userId: senderUserId },
    ]);

    await db.insert(userStatuses).values([
      { status: UserStatus.Online, userId: allOnlineUserId },
      { status: UserStatus.Offline, userId: allOfflineUserId },
      { status: UserStatus.Online, userId: directMessageOnlineUserId },
      { status: UserStatus.Offline, userId: directMessageOfflineUserId },
      { status: UserStatus.Online, userId: neverUserId },
      { status: UserStatus.Online, userId: senderUserId },
      // AllNullStatusUserId intentionally has no status row (null status = treated as online for @here)
    ]);
  });

  test("no mention notifies All members excluding sender", async () => {
    expect.hasAssertions();

    const result = await getPushSubscriptionsForMessage(db, {
      message: "",
      partitionKey: roomId,
      userId: senderUserId,
    });

    const endpointSet = new Set(result.map((subscription) => subscription.endpoint));

    expect(result).toHaveLength(3);
    expect(endpointSet.has(getEndpoint(allOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allOfflineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allNullStatusUserId))).toBe(true);
  });

  test("regular mention notifies All and mentioned DirectMessage members", async () => {
    expect.hasAssertions();

    const result = await getPushSubscriptionsForMessage(db, {
      message: getMentionMessage(directMessageOnlineUserId),
      partitionKey: roomId,
      userId: senderUserId,
    });

    const endpointSet = new Set(result.map((subscription) => subscription.endpoint));

    expect(result).toHaveLength(4);
    expect(endpointSet.has(getEndpoint(allOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allOfflineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allNullStatusUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(directMessageOnlineUserId))).toBe(true);
  });

  test("@everyone notifies All and DirectMessage members excluding Never and sender", async () => {
    expect.hasAssertions();

    const result = await getPushSubscriptionsForMessage(db, {
      message: getMentionMessage(MENTION_EVERYONE_ID),
      partitionKey: roomId,
      userId: senderUserId,
    });

    const endpointSet = new Set(result.map((subscription) => subscription.endpoint));

    expect(result).toHaveLength(5);
    expect(endpointSet.has(getEndpoint(allOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allOfflineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allNullStatusUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(directMessageOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(directMessageOfflineUserId))).toBe(true);
  });

  test("@here notifies All and online DirectMessage members excluding offline DirectMessage and sender", async () => {
    expect.hasAssertions();

    const result = await getPushSubscriptionsForMessage(db, {
      message: getMentionMessage(MENTION_HERE_ID),
      partitionKey: roomId,
      userId: senderUserId,
    });

    const endpointSet = new Set(result.map((subscription) => subscription.endpoint));

    expect(result).toHaveLength(4);
    expect(endpointSet.has(getEndpoint(allOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allOfflineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allNullStatusUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(directMessageOnlineUserId))).toBe(true);
  });
});
