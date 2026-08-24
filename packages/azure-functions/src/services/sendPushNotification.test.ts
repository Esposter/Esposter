import type { Database } from "@esposter/db-schema";

import { sendPushNotification } from "#src/services/sendPushNotification";
import { setupWebPushSuite } from "#src/services/setupWebPushSuite.test";
import { webpush } from "#src/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import {
  NotificationType,
  pushSubscriptionsInMessage,
  roomsInMessage,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/webpush"), () => import("#src/services/webpush.test"));

// The generic web-push send/expiry matrix lives in sendWebPushNotifications.test.ts; here only the wiring.
describe(sendPushNotification, () => {
  const context = new InvocationContext();
  const message = "<p>a</p>";
  const name = "name";
  const senderUserId = crypto.randomUUID();
  const subscriberUserId = crypto.randomUUID();
  const roomId = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const notificationOptions = { icon: "", title: "" };
  const baseMessage = { message, partitionKey: roomId, rowKey };
  const standardMessage = { ...baseMessage, userId: senderUserId };
  const { pushSubscription, seedSession } = setupWebPushSuite(() => mockDb, subscriberUserId);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values([
      { email: "", emailVerified: true, id: senderUserId, name },
      { email: " ", emailVerified: true, id: subscriberUserId, name },
    ]);
    await seedSession();
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
