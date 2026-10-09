import { PUSH_RETRY_BASE_MILLISECONDS, PUSH_RETRY_CAP_MILLISECONDS } from "#src/services/queue/constants";
import { getRetryDelayMilliseconds } from "#src/services/queue/getRetryDelayMilliseconds";
import { describe, expect, test } from "vitest";

const LARGEST_DRAW = () => 1;

describe(getRetryDelayMilliseconds, () => {
  test("bounds the first retry by the base, and each later one by twice the one before", () => {
    expect.hasAssertions();

    expect(getRetryDelayMilliseconds(1, LARGEST_DRAW)).toBe(PUSH_RETRY_BASE_MILLISECONDS);
    expect(getRetryDelayMilliseconds(2, LARGEST_DRAW)).toBe(PUSH_RETRY_BASE_MILLISECONDS * 2);
  });

  test("never bounds a retry past the cap", () => {
    expect.hasAssertions();

    expect(getRetryDelayMilliseconds(20, LARGEST_DRAW)).toBe(PUSH_RETRY_CAP_MILLISECONDS);
  });

  test("draws the wait across the whole bound, so it may be none", () => {
    expect.hasAssertions();

    expect(getRetryDelayMilliseconds(3, () => 0)).toBe(0);
  });
});
