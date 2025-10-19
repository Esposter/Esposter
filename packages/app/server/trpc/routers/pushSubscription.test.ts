import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { pushSubscriptionRouter } from "@@/server/trpc/routers/pushSubscription";
import { pushSubscriptions } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("pushSubscription", () => {
  let caller: DecorateRouterRecord<TRPCRouter["pushSubscription"]>;
  let mockContext: Context;
  const endpoint = "https://.";
  const auth = "auth";
  const updatedAuth = "updatedAuth";
  const p256dh = "p256dh";
  const updatedP256dh = "updatedP256dh";

  beforeAll(async () => {
    const createCaller = createCallerFactory(pushSubscriptionRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(pushSubscriptions);
  });

  test("subscribes", async () => {
    expect.hasAssertions();

    const newPushSubscription = await caller.subscribe({ endpoint, expirationTime: null, keys: { auth, p256dh } });

    expect(newPushSubscription.endpoint).toBe(endpoint);
    expect(newPushSubscription.auth).toBe(auth);
    expect(newPushSubscription.p256dh).toBe(p256dh);
    expect(newPushSubscription.userId).toBe(getMockSession().user.id);
  });

  test("subscribes updates existing endpoint", async () => {
    expect.hasAssertions();

    const newPushSubscription = await caller.subscribe({ endpoint, keys: { auth, p256dh } });
    const updatedPushSubscription = await caller.subscribe({
      endpoint,
      keys: { auth: updatedAuth, p256dh: updatedP256dh },
    });

    expect(updatedPushSubscription.id).toBe(newPushSubscription.id);
    expect(updatedPushSubscription.auth).toBe(updatedAuth);
    expect(updatedPushSubscription.p256dh).toBe(updatedP256dh);
  });

  test("unsubscribes", async () => {
    expect.hasAssertions();

    const pushSubscription = await caller.subscribe({ endpoint, keys: { auth, p256dh } });
    const deletedPushSubscription = await caller.unsubscribe(endpoint);
    const readPushSubscriptions = await mockContext.db.select().from(pushSubscriptions);

    expect(deletedPushSubscription.id).toBe(pushSubscription.id);
    expect(deletedPushSubscription.endpoint).toBe(endpoint);
    expect(readPushSubscriptions).toHaveLength(0);
  });
});
