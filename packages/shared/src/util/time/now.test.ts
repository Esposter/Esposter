import { now } from "@/util/time/now";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/util/environment/getIsServer"), () => ({
  getIsServer: () => false,
}));

describe(now, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("increases with time", () => {
    expect.hasAssertions();

    const start = BigInt(now());
    vi.advanceTimersByTime(1);
    const end = BigInt(now());

    expect(end - start).toBe(BigInt(10 ** 6));
  });
});
