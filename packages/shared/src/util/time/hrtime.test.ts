import { hrtime } from "@/util/time/hrtime";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/util/environment/getIsServer"), () => ({
  getIsServer: () => false,
}));

describe(hrtime, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("gets current time", () => {
    expect.hasAssertions();

    expect(hrtime()).toStrictEqual([0, 0]);

    vi.advanceTimersByTime(1);

    expect(hrtime()).toStrictEqual([0, 10 ** 6]);
  });

  test("calculates diff", () => {
    expect.hasAssertions();

    const start = hrtime();
    vi.advanceTimersByTime(1);

    expect(hrtime(start)).toStrictEqual([0, 10 ** 6]);
  });
});
