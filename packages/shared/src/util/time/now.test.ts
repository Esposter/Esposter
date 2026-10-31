import { now } from "#src/util/time/now";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(now, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("increases with time and never repeats a reading", () => {
    expect.hasAssertions();

    const start = BigInt(now());
    const repeated = BigInt(now());
    vi.advanceTimersByTime(1);
    const end = BigInt(now());

    expect(repeated - start).toBe(1n);
    expect(end - start).toBe(BigInt(10 ** 6));
  });
});
