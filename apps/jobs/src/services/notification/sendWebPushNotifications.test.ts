import type { Database } from "@esposter/db-schema";

import { DEAD_PUSH_SUBSCRIPTION_STATUS_CODES, MAX_CONCURRENT_PUSH_SENDS } from "#src/services/notification/constants";
import { sendWebPushNotifications } from "#src/services/notification/sendWebPushNotifications";
import { setupWebPushSuite } from "#src/services/notification/setupWebPushSuite.test";
import { webpush } from "#src/services/notification/webpush.test";
import { createMockDb } from "@esposter/db-mock";
import { createUser } from "@esposter/db-mock/workers";
import { pushSubscriptionsInNotification, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { WebPushError } from "web-push";

let mockDb: Database;

vi.mock(import("#src/services/shared/getDb"), () => ({
  getDb() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/notification/webpush"), () => import("#src/services/notification/webpush.test"));

describe(sendWebPushNotifications, () => {
  const payload = "";
  const userId = v7();
  const { pushSubscription, seedSession } = setupWebPushSuite(() => mockDb, userId);
  const seedSubscription = async () =>
    takeOne(await mockDb.insert(pushSubscriptionsInNotification).values(pushSubscription).returning(), 0);

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
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

  test.each(DEAD_PUSH_SUBSCRIPTION_STATUS_CODES)("deletes a dead subscription on %i", async (statusCode) => {
    expect.hasAssertions();

    const { auth, endpoint, expirationTime, id, p256dh } = await seedSubscription();
    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(new WebPushError("", statusCode, {}, "", ""));
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
      id: v7(),
    }));
    await sendWebPushNotifications(subscriptions, payload);
    sendNotification.mockReset();

    expect(peakInFlight).toBe(MAX_CONCURRENT_PUSH_SENDS);
  });

  // A stored endpoint off the push services is never POSTed to, whatever row it came from, so the worker cannot be made to
  // Send a request to an arbitrary host
  test("never POSTs to an endpoint whose host is not a browser's push service", async () => {
    expect.hasAssertions();

    await sendWebPushNotifications(
      [{ auth: "", endpoint: "https://attacker.example", expirationTime: null, id: v7(), p256dh: "" }],
      payload,
    );

    expect(vi.mocked(webpush.sendNotification)).not.toHaveBeenCalled();
  });

  test("keeps subscription when send fails with any other error", async () => {
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
