import { createInMemoryRateLimiterStore } from "#src/runtime/services/createInMemoryRateLimiterStore";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(createInMemoryRateLimiterStore, () => {
  const INTERVAL_IN_MILLISECONDS = 60_000;
  const MAX_ENTRIES = 2;
  const KEY = "203.0.113.7";

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("a window counts its requests, then starts over once it has ended", async () => {
    expect.hasAssertions();

    const store = createInMemoryRateLimiterStore(MAX_ENTRIES);

    expect(await store.increment(KEY, INTERVAL_IN_MILLISECONDS)).toStrictEqual({
      count: 1,
      resetAt: INTERVAL_IN_MILLISECONDS,
    });
    expect(await store.increment(KEY, INTERVAL_IN_MILLISECONDS)).toStrictEqual({
      count: 2,
      resetAt: INTERVAL_IN_MILLISECONDS,
    });

    vi.setSystemTime(INTERVAL_IN_MILLISECONDS);

    expect(await store.increment(KEY, INTERVAL_IN_MILLISECONDS)).toStrictEqual({
      count: 1,
      resetAt: 2 * INTERVAL_IN_MILLISECONDS,
    });
  });

  test("#230 a key whose window has ended starts a new one, never an absent entry read as null", async () => {
    expect.hasAssertions();

    const store = createInMemoryRateLimiterStore(MAX_ENTRIES);
    await store.increment(KEY, INTERVAL_IN_MILLISECONDS);

    vi.setSystemTime(INTERVAL_IN_MILLISECONDS + 1);

    await expect(store.increment(KEY, INTERVAL_IN_MILLISECONDS)).resolves.toStrictEqual({
      count: 1,
      resetAt: 2 * INTERVAL_IN_MILLISECONDS + 1,
    });
  });

  test("past its size limit the least recently counted key is dropped, not the one just counted", async () => {
    expect.hasAssertions();

    const store = createInMemoryRateLimiterStore(MAX_ENTRIES);
    await store.increment("first", INTERVAL_IN_MILLISECONDS);
    await store.increment("second", INTERVAL_IN_MILLISECONDS);
    await store.increment("first", INTERVAL_IN_MILLISECONDS);
    await store.increment("third", INTERVAL_IN_MILLISECONDS);

    expect(await store.increment("first", INTERVAL_IN_MILLISECONDS)).toStrictEqual({
      count: 3,
      resetAt: INTERVAL_IN_MILLISECONDS,
    });
    expect(await store.increment("second", INTERVAL_IN_MILLISECONDS)).toStrictEqual({
      count: 1,
      resetAt: INTERVAL_IN_MILLISECONDS,
    });
  });
});
