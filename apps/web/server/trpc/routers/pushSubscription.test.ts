import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { pushSubscriptionRouter } from "#server/trpc/routers/pushSubscription";
import { pushSubscriptionsInNotification } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("pushSubscriptionRouter", () => {
  let mockContext: Context;
  let pushSubscriptionCaller: DecorateRouterRecord<TRPCRouter["pushSubscription"]>;
  const endpoint = "https://.";
  const auth = "auth";
  const updatedAuth = "updatedAuth";
  const p256dh = "p256dh";
  const updatedP256dh = "updatedP256dh";

  beforeAll(async () => {
    mockContext = await createMockContext();
    pushSubscriptionCaller = createCallerFactory(pushSubscriptionRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(pushSubscriptionsInNotification);
  });

  test("subscribes", async () => {
    expect.hasAssertions();

    const newPushSubscription = await pushSubscriptionCaller.subscribe({
      endpoint,
      expirationTime: null,
      keys: { auth, p256dh },
    });
    const userId = getMockSession().user.id;

    expect(newPushSubscription.endpoint).toBe(endpoint);
    expect(newPushSubscription.auth).toBe(auth);
    expect(newPushSubscription.p256dh).toBe(p256dh);
    expect(newPushSubscription.userId).toBe(userId);
  });

  test("subscribes updates existing endpoint", async () => {
    expect.hasAssertions();

    const newPushSubscription = await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    const updatedPushSubscription = await pushSubscriptionCaller.subscribe({
      endpoint,
      keys: { auth: updatedAuth, p256dh: updatedP256dh },
    });

    expect(updatedPushSubscription.id).toBe(newPushSubscription.id);
    expect(updatedPushSubscription.auth).toBe(updatedAuth);
    expect(updatedPushSubscription.p256dh).toBe(updatedP256dh);
  });

  test("unsubscribes, and an endpoint with no subscription unsubscribes as a no-op", async () => {
    expect.hasAssertions();

    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    await pushSubscriptionCaller.unsubscribe(endpoint);

    await expect(pushSubscriptionCaller.unsubscribe(endpoint)).resolves.toBeUndefined();
    await expect(mockContext.db.query.pushSubscriptionsInNotification.findFirst()).resolves.toBeUndefined();
  });
});
