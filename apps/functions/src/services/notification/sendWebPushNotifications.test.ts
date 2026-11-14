import type { Database } from "@esposter/db-schema";

import { MAX_CONCURRENT_PUSH_SENDS } from "#src/services/notification/constants";
import { sendWebPushNotifications } from "#src/services/notification/sendWebPushNotifications";
import { setupWebPushSuite } from "#src/services/notification/setupWebPushSuite.test";
import { webpush } from "#src/services/notification/webpush.test";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptionsInNotification, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { WebPushError } from "web-push";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/notification/webpush"), () => import("#src/services/notification/webpush.test"));

describe(sendWebPushNotifications, () => {
  const payload = "";
  const userId = crypto.randomUUID();
  const { pushSubscription, seedSession } = setupWebPushSuite(() => mockDb, userId);
  const seedSubscription = async () =>
    takeOne(await mockDb.insert(pushSubscriptionsInNotification).values(pushSubscription).returning(), 0);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    await seedSession();
  });

  test("sends payload to subscription", async () => {
    expect.hasAssertions();

    const { auth, endpoint, expirationTime, id, p256dh } = await seedSubscription();
    await sendWebPushNotifications([{ auth, endpoint, expirationTime, id, p256dh }], payload);

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledExactlyOnceWith(
      { endpoint, expirationTime: null, keys: { auth, p256dh } },
      payload,
    );
  });

  test("deletes expired subscription when status code is 410", async () => {
    expect.hasAssertions();

    const { auth, endpoint, expirationTime, id, p256dh } = await seedSubscription();
    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(new WebPushError("", 410, {}, "", ""));
    await sendWebPushNotifications([{ auth, endpoint, expirationTime, id, p256dh }], payload);
    const remainingPushSubscriptions = await mockDb
      .select()
      .from(pushSubscriptionsInNotification)
      .where(eq(pushSubscriptionsInNotification.id, id));

    expect(remainingPushSubscriptions).toHaveLength(0);
  });

  test("keeps at most MAX_CONCURRENT_PUSH_SENDS sends in flight", async () => {
    expect.hasAssertions();

    const sendNotification = vi.mocked(webpush.sendNotification);
    let inFlight = 0;
    let peakInFlight = 0;
    sendNotification.mockImplementation(async () => {
      inFlight += 1;
      peakInFlight = Math.max(peakInFlight, inFlight);
      // Settles on a later tick, so every send a wave starts is in flight before any of them returns
      await Promise.resolve();
      inFlight -= 1;
      return { body: "", headers: {}, statusCode: 0 };
    });
    const subscriptions = Array.from({ length: MAX_CONCURRENT_PUSH_SENDS + 1 }, () => ({
      ...pushSubscription,
      expirationTime: null,
      id: crypto.randomUUID(),
    }));
    await sendWebPushNotifications(subscriptions, payload);
    sendNotification.mockReset();

    expect(peakInFlight).toBe(MAX_CONCURRENT_PUSH_SENDS);
  });

  test("keeps subscription when send fails with a non-410 error", async () => {
    expect.hasAssertions();

    const { auth, endpoint, expirationTime, id, p256dh } = await seedSubscription();
    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(new WebPushError("", 500, {}, "", ""));
    await sendWebPushNotifications([{ auth, endpoint, expirationTime, id, p256dh }], payload);
    const remainingPushSubscriptions = await mockDb
      .select()
      .from(pushSubscriptionsInNotification)
      .where(eq(pushSubscriptionsInNotification.id, id));

    expect(remainingPushSubscriptions).toHaveLength(1);
  });
});
