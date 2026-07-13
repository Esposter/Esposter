import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { sendWebPushNotifications } from "@/services/sendWebPushNotifications";
import { setupWebPushSuite } from "@/services/setupWebPushSuite.test";
import { webpush } from "@/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptionsInMessage, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { WebPushError } from "web-push";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

describe(sendWebPushNotifications, () => {
  const context = new InvocationContext();
  const name = "name";
  const payload = "";
  const userId = randomUUID();
  const { pushSubscription } = setupWebPushSuite(() => mockDb, userId);
  const seedSubscription = async () =>
    takeOne(await mockDb.insert(pushSubscriptionsInMessage).values(pushSubscription).returning(), 0);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name });
  });

  test("sends payload to subscription", async () => {
    expect.hasAssertions();

    const { auth, endpoint, expirationTime, id, p256dh } = await seedSubscription();
    await sendWebPushNotifications(context, [{ auth, endpoint, expirationTime, id, p256dh }], payload);

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledExactlyOnceWith(
      { endpoint, expirationTime: null, keys: { auth, p256dh } },
      payload,
    );
  });

  test("deletes expired subscription when status code is 410", async () => {
    expect.hasAssertions();

    const { auth, endpoint, expirationTime, id, p256dh } = await seedSubscription();
    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(new WebPushError("Gone", 410, {}, "", ""));
    await sendWebPushNotifications(context, [{ auth, endpoint, expirationTime, id, p256dh }], payload);
    const remainingPushSubscriptions = await mockDb
      .select()
      .from(pushSubscriptionsInMessage)
      .where(eq(pushSubscriptionsInMessage.id, id));

    expect(remainingPushSubscriptions).toHaveLength(0);
  });

  test("keeps subscription when send fails with a non-410 error", async () => {
    expect.hasAssertions();

    const { auth, endpoint, expirationTime, id, p256dh } = await seedSubscription();
    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(new WebPushError("Server Error", 500, {}, "", ""));
    await sendWebPushNotifications(context, [{ auth, endpoint, expirationTime, id, p256dh }], payload);
    const remainingPushSubscriptions = await mockDb
      .select()
      .from(pushSubscriptionsInMessage)
      .where(eq(pushSubscriptionsInMessage.id, id));

    expect(remainingPushSubscriptions).toHaveLength(1);
  });
});
