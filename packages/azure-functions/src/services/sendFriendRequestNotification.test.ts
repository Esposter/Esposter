import type { Database } from "@esposter/db-schema";

import { sendFriendRequestNotification } from "@/services/sendFriendRequestNotification";
import { setupWebPushSuite } from "@/services/setupWebPushSuite.test";
import { webpush } from "@/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptionsInMessage, users } from "@esposter/db-schema";
import { beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

// The generic web-push send/expiry matrix lives in sendWebPushNotifications.test.ts; here only the wiring.
describe(sendFriendRequestNotification, () => {
  const context = new InvocationContext();
  const name = "name";
  const notificationOptions = { icon: "", title: "" };
  const receiverId = crypto.randomUUID();
  const { pushSubscription } = setupWebPushSuite(() => mockDb, receiverId);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: receiverId, name });
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
});
