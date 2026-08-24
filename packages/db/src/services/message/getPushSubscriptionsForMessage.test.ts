import type { Database } from "@esposter/db-schema";

import { dayjs } from "#src/services/dayjs/index";
import { createMention } from "#src/services/message/createMention.test";
import { createUser } from "#src/services/message/createUser.test";
import { getPushSubscriptionsForMessage } from "#src/services/message/getPushSubscriptionsForMessage";
import { createMockDb } from "@esposter/db-mock";
import {
  NotificationType,
  pushSubscriptionsInMessage,
  roomsInMessage,
  RoomType,
  sessions,
  users,
  UserStatus,
  userStatusesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { ID_SEPARATOR, MENTION_EVERYONE_ID, MENTION_HERE_ID } from "@esposter/shared";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const getEndpoint = (userId: string) => `https://push.example.com/${userId}`;
// A subscription names the session that created it, so each user gets one — derived rather than mapped, so
// Nothing has to look an id back up
const getSessionId = (userId: string) => `session${ID_SEPARATOR}${userId}`;

describe(getPushSubscriptionsForMessage, () => {
  let db: Database;
  const name = "name";
  const roomId = crypto.randomUUID();
  const allOnlineUserId = crypto.randomUUID();
  const allOfflineUserId = crypto.randomUUID();
  const allNullStatusUserId = crypto.randomUUID();
  const directMessageOnlineUserId = crypto.randomUUID();
  const directMessageOfflineUserId = crypto.randomUUID();
  const neverUserId = crypto.randomUUID();
  const senderUserId = crypto.randomUUID();
  const sender = { partitionKey: roomId, userId: senderUserId };
  const userIds = [
    allOnlineUserId,
    allOfflineUserId,
    allNullStatusUserId,
    directMessageOnlineUserId,
    directMessageOfflineUserId,
    neverUserId,
    senderUserId,
  ];

  beforeAll(async () => {
    db = await createMockDb();
    const createdAt = new Date();
    await db.insert(users).values(userIds.map((id) => createUser(id, createdAt, name)));
    await db.insert(sessions).values(
      userIds.map((userId) => ({
        expiresAt: dayjs(createdAt).add(1, "day").toDate(),
        id: getSessionId(userId),
        token: getSessionId(userId),
        updatedAt: createdAt,
        userId,
      })),
    );

    await db.insert(roomsInMessage).values({
      id: roomId,
      name,
      type: RoomType.Room,
      userId: allOnlineUserId,
    });

    await db.insert(usersToRoomsInMessage).values([
      { notificationType: NotificationType.All, roomId, userId: allOnlineUserId },
      { notificationType: NotificationType.All, roomId, userId: allOfflineUserId },
      { notificationType: NotificationType.All, roomId, userId: allNullStatusUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: directMessageOnlineUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: directMessageOfflineUserId },
      { notificationType: NotificationType.Never, roomId, userId: neverUserId },
      { notificationType: NotificationType.All, roomId, userId: senderUserId },
    ]);

    await db.insert(pushSubscriptionsInMessage).values(
      userIds.map((userId) => ({
        auth: "",
        endpoint: getEndpoint(userId),
        p256dh: "",
        sessionId: getSessionId(userId),
        userId,
      })),
    );

    await db.insert(userStatusesInMessage).values([
      { status: UserStatus.Online, userId: allOnlineUserId },
      { status: UserStatus.Offline, userId: allOfflineUserId },
      { status: UserStatus.Online, userId: directMessageOnlineUserId },
      { status: UserStatus.Offline, userId: directMessageOfflineUserId },
      { status: UserStatus.Online, userId: neverUserId },
      { status: UserStatus.Online, userId: senderUserId },
      // AllNullStatusUserId intentionally has no status row (null status = treated as online for @here)
    ]);
  });

  afterAll(async () => {
    await db.delete(users);
  });

  test("no mention notifies All members excluding sender", async () => {
    expect.hasAssertions();

    const result = await getPushSubscriptionsForMessage(db, { ...sender, message: "" });
    const endpointSet = new Set(result.map((pushSubscription) => pushSubscription.endpoint));

    expect(result).toHaveLength(3);
    expect(endpointSet.has(getEndpoint(allOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allOfflineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allNullStatusUserId))).toBe(true);
  });

  test("no userId notifies every All member without excluding a sender (webhook message)", async () => {
    expect.hasAssertions();

    const result = await getPushSubscriptionsForMessage(db, {
      message: "",
      partitionKey: roomId,
    });
    const endpointSet = new Set(result.map((pushSubscription) => pushSubscription.endpoint));

    expect(result).toHaveLength(4);
    expect(endpointSet.has(getEndpoint(allOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allOfflineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allNullStatusUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(senderUserId))).toBe(true);
  });

  test("regular mention notifies All and mentioned DirectMessage members", async () => {
    expect.hasAssertions();

    const result = await getPushSubscriptionsForMessage(db, {
      ...sender,
      message: createMention(directMessageOnlineUserId),
    });
    const endpointSet = new Set(result.map((pushSubscription) => pushSubscription.endpoint));

    expect(result).toHaveLength(4);
    expect(endpointSet.has(getEndpoint(allOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allOfflineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allNullStatusUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(directMessageOnlineUserId))).toBe(true);
  });

  test("@everyone notifies All and DirectMessage members excluding Never and sender", async () => {
    expect.hasAssertions();

    const result = await getPushSubscriptionsForMessage(db, {
      ...sender,
      message: createMention(MENTION_EVERYONE_ID),
    });

    const endpointSet = new Set(result.map((pushSubscription) => pushSubscription.endpoint));

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
      ...sender,
      message: createMention(MENTION_HERE_ID),
    });

    const endpointSet = new Set(result.map((pushSubscription) => pushSubscription.endpoint));

    expect(result).toHaveLength(4);
    expect(endpointSet.has(getEndpoint(allOnlineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allOfflineUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(allNullStatusUserId))).toBe(true);
    expect(endpointSet.has(getEndpoint(directMessageOnlineUserId))).toBe(true);
  });
});
