import type { Database, PushNotificationPayload, Topic } from "@esposter/db-schema";

import { MOCK_ENDPOINT } from "#src/services/notification/constants.test";
import { sendNotification } from "#src/services/notification/sendNotification";
import { setupWebPushSuite } from "#src/services/notification/setupWebPushSuite.test";
import { webpush } from "#src/services/notification/webpush.test";
import { getMockPublishedTopics, getReaderWakes, MockPublishedTopics } from "#src/services/realtime/publishTopics.test";
import { createUser } from "#src/services/shared/createUser.test";
import { getDb } from "#src/services/shared/getDb";
import { runUnit } from "#src/services/shared/runUnit";
import { readNotificationRows } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AppNotificationType,
  getScopeTopic,
  notificationsInNotification,
  NotificationType,
  pushSubscriptionsInNotification,
  roomsInMessage,
  sessionsInAuth,
  START_PAGE_CURSOR,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { jsonDateParse, RoutePath, takeOne } from "@esposter/shared";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/notification/webpush"), () => import("#src/services/notification/webpush.test"));

// The generic web-push send/expiry matrix lives in sendWebPushNotifications.test.ts; what this one owns is the
// Fan-out AppNotificationTypeChannelMap decides — which types write a bell row, which reach a device, and which session
// A notification skips because it caused it.
describe(sendNotification, () => {
  let mockDb: Database;

  const message = "<p>a</p>";
  const name = "name";
  const path = "path";
  const title = "title";
  const senderUserId = v7();
  const subscriberUserId = v7();
  const roomId = v7();
  const messageId = 1;
  const replyId = 2;
  const bellPageLimit = 10;
  const actingSessionId = v7();
  const standardMessage = { id: messageId, message, roomId, userId: senderUserId };
  const { pushSubscription, seedSession } = setupWebPushSuite(() => mockDb, subscriberUserId);

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await mockDb.insert(usersInAuth).values([createUser(senderUserId), createUser(subscriberUserId)]);
    await seedSession();
    // The subscriber's second device, so a notification the first one caused still has somewhere to land
    await mockDb
      .insert(sessionsInAuth)
      .values({
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
    await mockDb.delete(notificationsInNotification);
    MockPublishedTopics.length = 0;
    vi.restoreAllMocks();
  });

  test("returns early when a message has no text content", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptionsInNotification).values(pushSubscription);
    await sendNotification({
      message: { ...standardMessage, message: "<p></p>" },
      threadRootId: null,
      type: AppNotificationType.Message,
    });

    expect(vi.mocked(webpush.sendNotification)).not.toHaveBeenCalled();
  });

  test("a message reaches the device without writing a bell row", async () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", "");
    await mockDb.insert(pushSubscriptionsInNotification).values(pushSubscription);
    await sendNotification({ message: standardMessage, threadRootId: null, type: AppNotificationType.Message });

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
    // A message outside a thread has no thread root, so the link falls through to the message itself
    expect(
      jsonDateParse<PushNotificationPayload>(String(vi.mocked(webpush.sendNotification).mock.calls[0]?.[1])).data.url,
    ).toBe(RoutePath.MessagesMessage(roomId, messageId));
    await expect(mockDb.select().from(notificationsInNotification)).resolves.toStrictEqual([]);
  });

  test("a reply's link is its thread root's", async () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", "");
    await mockDb.insert(pushSubscriptionsInNotification).values(pushSubscription);
    await sendNotification({
      message: { ...standardMessage, id: replyId },
      threadRootId: messageId,
      type: AppNotificationType.Message,
    });

    expect(
      jsonDateParse<PushNotificationPayload>(String(vi.mocked(webpush.sendNotification).mock.calls[0]?.[1])).data.url,
    ).toBe(RoutePath.MessagesMessage(roomId, messageId));
  });

  // The bell insert is the last step allowed to fail this handler. The queue reads a throw as a retry request
  // And QueueJobMaxRetriesMap marks this function replayable, so a trim that failed the invocation would
  // Have the rows written again on the redelivery
  test("keeps the bell row and does not throw when the retention trim fails", async () => {
    expect.hasAssertions();

    const trim = vi.spyOn(getDb(), "delete").mockImplementationOnce(() => {
      throw new Error(" ");
    });

    await expect(
      sendNotification({ path, title, type: AppNotificationType.ResourceOperation, userId: subscriberUserId }),
    ).resolves.toBeUndefined();
    await expect(mockDb.select().from(notificationsInNotification)).resolves.toHaveLength(1);
    expect(trim).toHaveBeenCalledTimes(1);
  });

  test("a resource operation writes a bell row and skips the session that caused it", async () => {
    expect.hasAssertions();

    await mockDb
      .insert(pushSubscriptionsInNotification)
      .values([pushSubscription, { ...pushSubscription, endpoint: " ", sessionId: actingSessionId }]);
    await sendNotification({
      excludedSessionId: actingSessionId,
      path,
      title,
      type: AppNotificationType.ResourceOperation,
      userId: subscriberUserId,
    });
    const [notification] = await mockDb.select().from(notificationsInNotification);

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(webpush.sendNotification).mock.calls[0]?.[0].endpoint).toBe(MOCK_ENDPOINT);
    expect(notification?.title).toBe(title);
    expect(notification?.type).toBe(AppNotificationType.ResourceOperation);
  });

  // A bell row's topic is published once the row lands, so the bell is woken before the device push waits on each device
  test("a bell row's topic is published before the device push is sent", async () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", "");
    await mockDb.insert(pushSubscriptionsInNotification).values(pushSubscription);
    const publishedAtPush: Topic[][] = [];
    vi.mocked(webpush.sendNotification).mockImplementationOnce(() => {
      publishedAtPush.push(getMockPublishedTopics());
      return Promise.resolve({ body: "", headers: {}, statusCode: 201 });
    });

    await runUnit(() =>
      sendNotification({ path, title, type: AppNotificationType.ResourceOperation, userId: subscriberUserId }),
    );

    expect(takeOne(publishedAtPush, 0)).toContain(
      getScopeTopic(getTableName(notificationsInNotification), "userId", subscriberUserId),
    );
  });

  // The bell reads the rows of its recipient through the reader the web's notification list reads them with, so the bell row a
  // Unit writes is what wakes it
  test("a bell row wakes its recipient's bell, which reads the rows of that recipient", async () => {
    expect.hasAssertions();

    await runUnit(() =>
      sendNotification({ path, title, type: AppNotificationType.ResourceOperation, userId: subscriberUserId }),
    );

    await expect(
      getReaderWakes(mockDb, (database) =>
        readNotificationRows(database, { cursor: START_PAGE_CURSOR, limit: bellPageLimit, userId: subscriberUserId }),
      ),
    ).resolves.toContain(getScopeTopic(getTableName(notificationsInNotification), "userId", subscriberUserId));
  });
});
