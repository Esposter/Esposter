import type { RateLimiterStore } from "#src/models/RateLimiterStore";

import { getRetryAfterSeconds } from "#src/runtime/services/getRetryAfterSeconds";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(getRetryAfterSeconds, () => {
  const INTERVAL_IN_MILLISECONDS = 60_000;
  const TOKENS_PER_INTERVAL = 2;
  const KEY = "203.0.113.7";

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("a request within the window's count is allowed", async () => {
    expect.hasAssertions();

    const store: RateLimiterStore = {
      increment: vi.fn<RateLimiterStore["increment"]>(() =>
        Promise.resolve({ count: TOKENS_PER_INTERVAL, resetAt: INTERVAL_IN_MILLISECONDS }),
      ),
    };

    await expect(
      getRetryAfterSeconds(store, KEY, {
        intervalInMilliseconds: INTERVAL_IN_MILLISECONDS,
        tokensPerInterval: TOKENS_PER_INTERVAL,
      }),
    ).resolves.toBeUndefined();
  });

  test("a request past the window's count is refused with the seconds until the window ends", async () => {
    expect.hasAssertions();

    const store: RateLimiterStore = {
      increment: vi.fn<RateLimiterStore["increment"]>(() =>
        Promise.resolve({ count: TOKENS_PER_INTERVAL + 1, resetAt: INTERVAL_IN_MILLISECONDS }),
      ),
    };

    await expect(
      getRetryAfterSeconds(store, KEY, {
        intervalInMilliseconds: INTERVAL_IN_MILLISECONDS,
        tokensPerInterval: TOKENS_PER_INTERVAL,
      }),
    ).resolves.toBe(INTERVAL_IN_MILLISECONDS / 1000);
  });

  test("a refused request is told to wait at least one second, as Retry-After is never zero", async () => {
    expect.hasAssertions();

    const store: RateLimiterStore = {
      increment: vi.fn<RateLimiterStore["increment"]>(() =>
        Promise.resolve({ count: TOKENS_PER_INTERVAL + 1, resetAt: 0 }),
      ),
    };

    await expect(
      getRetryAfterSeconds(store, KEY, {
        intervalInMilliseconds: INTERVAL_IN_MILLISECONDS,
        tokensPerInterval: TOKENS_PER_INTERVAL,
      }),
    ).resolves.toBe(1);
  });
});
