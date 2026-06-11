import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { sendFriendRequestNotification } from "@/services/sendFriendRequestNotification";
import { webpush } from "@/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptionsInMessage, users } from "@esposter/db-schema";
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

describe(sendFriendRequestNotification, () => {
  const context = new InvocationContext();
  const endpoint = "http://mock-endpoint";
  const name = "name";
  const notificationOptions = { icon: "", title: "" };
  const receiverId = crypto.randomUUID();
  const pushSubscription = { auth: "", endpoint, p256dh: "", userId: receiverId };

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: receiverId, name });
  });

  afterEach(async () => {
    await mockDb.delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.userId, receiverId));
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("completes without error when user has no push subscriptions", async () => {
    expect.hasAssertions();

    await expect(sendFriendRequestNotification(context, { notificationOptions, receiverId })).resolves.toBeUndefined();
  });

  test("sends notification to all subscriptions", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptionsInMessage).values(pushSubscription);

    await sendFriendRequestNotification(context, { notificationOptions, receiverId });

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
  });

  test("deletes expired subscription when status code is 410", async () => {
    expect.hasAssertions();

    const insertedPushSubscription = takeOne(
      await mockDb.insert(pushSubscriptionsInMessage).values(pushSubscription).returning(),
      0,
    );

    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(new WebPushError("Gone", 410, {}, "", ""));

    await sendFriendRequestNotification(context, { notificationOptions, receiverId });

    const remainingPushSubscriptions = await mockDb
      .select()
      .from(pushSubscriptionsInMessage)
      .where(eq(pushSubscriptionsInMessage.id, insertedPushSubscription.id));

    expect(remainingPushSubscriptions).toHaveLength(0);
  });
});
