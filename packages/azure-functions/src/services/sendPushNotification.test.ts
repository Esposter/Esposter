import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { sendPushNotification } from "@/services/sendPushNotification";
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
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { WebPushError } from "web-push";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

describe(sendPushNotification, () => {
  const context = new InvocationContext();
  const endpoint = "http://mock-endpoint";
  const message = "<p>hello</p>";
  const name = "name";
  const senderUserId = crypto.randomUUID();
  const subscriberUserId = crypto.randomUUID();
  const roomId = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const notificationOptions = { icon: "", title: "" };
  const pushSubscription = { auth: "", endpoint, p256dh: "", userId: subscriberUserId };
  const baseMessage = { message, partitionKey: roomId, rowKey };
  const standardMessage = { ...baseMessage, userId: senderUserId };

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

  afterEach(async () => {
    await mockDb.delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.userId, subscriberUserId));
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("returns early when message has no text content", async () => {
    expect.hasAssertions();

    await expect(
      sendPushNotification(context, { message: { ...standardMessage, message: "<p></p>" }, notificationOptions }),
    ).resolves.toBeUndefined();

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

  test("deletes expired subscription when status code is 410", async () => {
    expect.hasAssertions();

    const insertedPushSubscription = takeOne(
      await mockDb.insert(pushSubscriptionsInMessage).values(pushSubscription).returning(),
      0,
    );
    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(
      new WebPushError("Gone", 410, {} as Record<string, string>, "", ""),
    );
    await sendPushNotification(context, { message: standardMessage, notificationOptions });
    const remainingPushSubscriptions = await mockDb
      .select()
      .from(pushSubscriptionsInMessage)
      .where(eq(pushSubscriptionsInMessage.id, insertedPushSubscription.id));

    expect(remainingPushSubscriptions).toHaveLength(0);
  });
});
