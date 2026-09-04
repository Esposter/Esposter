import type { Database } from "@esposter/db-schema";

import { MOCK_ENDPOINT } from "#src/services/constants.test";
import { sendNotification } from "#src/services/notification/sendNotification";
import { setupWebPushSuite } from "#src/services/notification/setupWebPushSuite.test";
import { webpush } from "#src/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import {
  AppNotificationType,
  notifications,
  NotificationType,
  pushSubscriptions,
  roomsInMessage,
  sessions,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/webpush"), () => import("#src/services/webpush.test"));

// The generic web-push send/expiry matrix lives in sendWebPushNotifications.test.ts; what this one owns is the
// Fan-out AppNotificationTypeChannelMap decides — which types write a bell row, which reach a device, and which session
// A notification skips because it caused it.
describe(sendNotification, () => {
  const context = new InvocationContext();
  const message = "<p>a</p>";
  const name = "name";
  const path = "/path";
  const title = "title";
  const senderUserId = crypto.randomUUID();
  const subscriberUserId = crypto.randomUUID();
  const roomId = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const actingSessionId = `session${ID_SEPARATOR}acting`;
  const standardMessage = { message, partitionKey: roomId, rowKey, userId: senderUserId };
  const { pushSubscription, seedSession } = setupWebPushSuite(() => mockDb, subscriberUserId);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values([
      { email: "", emailVerified: true, id: senderUserId, name },
      { email: " ", emailVerified: true, id: subscriberUserId, name },
    ]);
    await seedSession();
    // The subscriber's second device, so a notification the first one caused still has somewhere to land
    await mockDb.insert(sessions).values({
      expiresAt: new Date(Date.now() + Temporal.Duration.from({ days: 1 }).total("milliseconds")),
      id: actingSessionId,
      token: actingSessionId,
      userId: subscriberUserId,
    });
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId: senderUserId });
    await mockDb.insert(usersToRoomsInMessage).values([
      { notificationType: NotificationType.All, roomId, userId: senderUserId },
      { notificationType: NotificationType.All, roomId, userId: subscriberUserId },
    ]);
  });

  afterEach(async () => {
    await mockDb.delete(notifications);
  });

  test("returns early when a message has no text content", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptions).values(pushSubscription);
    await sendNotification(context, {
      message: { ...standardMessage, message: "<p></p>" },
      type: AppNotificationType.Message,
    });

    expect(vi.mocked(webpush.sendNotification)).not.toHaveBeenCalled();
  });

  test("a message reaches the device without writing a bell row", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptions).values(pushSubscription);
    await sendNotification(context, {
      message: standardMessage,
      type: AppNotificationType.Message,
    });

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
    await expect(mockDb.select().from(notifications)).resolves.toStrictEqual([]);
  });

  test("a resource operation writes a bell row and skips the session that caused it", async () => {
    expect.hasAssertions();

    await mockDb
      .insert(pushSubscriptions)
      .values([pushSubscription, { ...pushSubscription, endpoint: "acting", sessionId: actingSessionId }]);
    await sendNotification(context, {
      excludedSessionId: actingSessionId,
      path,
      title,
      type: AppNotificationType.ResourceOperation,
      userId: subscriberUserId,
    });
    const [notification] = await mockDb.select().from(notifications);

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(webpush.sendNotification).mock.calls[0]?.[0].endpoint).toBe(MOCK_ENDPOINT);
    expect(notification?.title).toBe(title);
    expect(notification?.type).toBe(AppNotificationType.ResourceOperation);
  });
});
