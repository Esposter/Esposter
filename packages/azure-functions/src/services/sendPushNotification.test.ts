import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { sendPushNotification } from "@/services/sendPushNotification";
import { setupWebPushSuite } from "@/services/setupWebPushSuite.test";
import { webpush } from "@/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import {
  NotificationType,
  pushSubscriptionsInMessage,
  roomsInMessage,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

// The generic web-push send/expiry matrix lives in sendWebPushNotifications.test.ts; here only the wiring.
describe(sendPushNotification, () => {
  const context = new InvocationContext();
  const message = "<p>a</p>";
  const name = "name";
  const senderUserId = randomUUID();
  const subscriberUserId = randomUUID();
  const roomId = randomUUID();
  const rowKey = randomUUID();
  const notificationOptions = { icon: "", title: "" };
  const baseMessage = { message, partitionKey: roomId, rowKey };
  const standardMessage = { ...baseMessage, userId: senderUserId };
  const { pushSubscription } = setupWebPushSuite(() => mockDb, subscriberUserId);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values([
      { email: "", emailVerified: true, id: senderUserId, name },
      { email: " ", emailVerified: true, id: subscriberUserId, name },
    ]);
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId: senderUserId });
    await mockDb.insert(usersToRoomsInMessage).values([
      { notificationType: NotificationType.All, roomId, userId: senderUserId },
      { notificationType: NotificationType.All, roomId, userId: subscriberUserId },
    ]);
  });

  test("returns early when message has no text content", async () => {
    expect.hasAssertions();

    await sendPushNotification(context, {
      message: { ...standardMessage, message: "<p></p>" },
      notificationOptions,
    });

    expect(vi.mocked(webpush.sendNotification)).not.toHaveBeenCalled();
  });

  test("sends notification to subscribers", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptionsInMessage).values(pushSubscription);
    await sendPushNotification(context, { message: standardMessage, notificationOptions });

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
  });

  test("sends notification to subscribers when message has no userId (webhook message)", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptionsInMessage).values(pushSubscription);
    await sendPushNotification(context, { message: baseMessage, notificationOptions });

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
  });
});
