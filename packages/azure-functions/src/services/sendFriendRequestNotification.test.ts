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
  const receiverId = crypto.randomUUID();

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: receiverId, name });
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  afterEach(async () => {
    await mockDb.delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.userId, receiverId));
    vi.clearAllMocks();
  });

  test("completes without error when user has no push subscriptions", async () => {
    expect.hasAssertions();

    await expect(
      sendFriendRequestNotification(context, { notificationOptions: { icon: "", title: "" }, receiverId }),
    ).resolves.toBeUndefined();
  });

  test("sends notification to all subscriptions", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptionsInMessage).values({ auth: "", endpoint, p256dh: "", userId: receiverId });

    await sendFriendRequestNotification(context, { notificationOptions: { icon: "", title: "" }, receiverId });

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
  });

  test("deletes expired subscription when status code is 410", async () => {
    expect.hasAssertions();

    const pushSubscription = takeOne(
      await mockDb
        .insert(pushSubscriptionsInMessage)
        .values({ auth: "", endpoint, p256dh: "", userId: receiverId })
        .returning(),
      0,
    );

    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(
      new WebPushError("Gone", 410, {} as Record<string, string>, "", ""),
    );

    await sendFriendRequestNotification(context, { notificationOptions: { icon: "", title: "" }, receiverId });

    const remainingPushSubscriptions = await mockDb
      .select()
      .from(pushSubscriptionsInMessage)
      .where(eq(pushSubscriptionsInMessage.id, pushSubscription.id));

    expect(remainingPushSubscriptions).toHaveLength(0);
  });
});
