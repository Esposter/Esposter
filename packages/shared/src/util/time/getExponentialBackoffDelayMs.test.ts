import { getExponentialBackoffDelayMs } from "#src/util/time/getExponentialBackoffDelayMs";
import { describe, expect, test } from "vitest";

describe(getExponentialBackoffDelayMs, () => {
  test("doubles from the base with each attempt, and holds at the maximum", () => {
    expect.hasAssertions();

    expect([0, 1, 2, 20].map((attempt) => getExponentialBackoffDelayMs(attempt, 1, 4))).toStrictEqual([1, 2, 4, 4]);
  });
});
