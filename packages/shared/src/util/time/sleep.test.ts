import { sleep } from "#src/util/time/sleep";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(sleep, () => {
  const durationMs = 2;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("resolves only after durationMs has elapsed", async () => {
    expect.hasAssertions();

    let isResolved = false;
    const promise = (async () => {
      await sleep(durationMs);
      isResolved = true;
    })();
    await vi.advanceTimersByTimeAsync(durationMs - 1);

    expect(isResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await promise;

    expect(isResolved).toBe(true);
  });
});
