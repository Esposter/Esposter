import type { SubscriptionStartHandlers } from "@/models/shared/SubscriptionStartHandlers";

import { subscribeStarted } from "@/services/shared/subscribeStarted";
import { noop } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe(subscribeStarted, () => {
  const subscription = { unsubscribe: noop };

  // The handlers are handed over synchronously, and the test takes them off the subscribe call the way the caller does
  const subscribeCapturing = () => {
    const { promise: handlers, resolve: onHandlers } = Promise.withResolvers<SubscriptionStartHandlers>();
    const started = subscribeStarted((startHandlers) => {
      onHandlers(startHandlers);
      return subscription;
    });
    return { handlers, started };
  };
  // Records whether the promise has settled, by the one thing a settled promise does: run its continuation
  const trackSettled = (started: Promise<unknown>) => {
    const settlement = { isSettled: false };
    const settled = (async () => {
      await started;
      settlement.isSettled = true;
    })();
    return { settled, settlement };
  };

  // A read is issued only once the server has begun the subscription, so the promise holds until that answer arrives
  test("holds until the server has started the subscription", async () => {
    expect.hasAssertions();

    const { handlers, started } = subscribeCapturing();
    const { settled, settlement } = trackSettled(started);
    await flushPromises();

    expect(settlement.isSettled).toBe(false);

    (await handlers).onStarted();
    await settled;

    await expect(started).resolves.toBe(subscription);
  });

  // An event the server refuses never starts, and a read that waited on it would wait forever
  test("settles when the subscription fails before it starts", async () => {
    expect.hasAssertions();

    const { handlers, started } = subscribeCapturing();
    (await handlers).onError();

    await expect(started).resolves.toBe(subscription);
  });

  // A socket that cannot open never starts anything, and it reports so as a connection state carrying an error. A socket
  // That is still connecting, with no error, keeps the subscription waiting
  test("settles when the connection reports that it cannot open, and not while it is still connecting", async () => {
    expect.hasAssertions();

    const { handlers, started } = subscribeCapturing();
    const { settled, settlement } = trackSettled(started);
    (await handlers).onConnectionStateChange({ error: null });
    await flushPromises();

    expect(settlement.isSettled).toBe(false);

    (await handlers).onConnectionStateChange({ error: new Error(" ") });
    await settled;

    await expect(started).resolves.toBe(subscription);
  });
});
