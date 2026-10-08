import { computeHomeAccrued } from "#src/services/home/computeHomeAccrued";
import { HOME_RATE_PERIOD_SECONDS } from "#src/services/home/constants";
import { describe, expect, test } from "vitest";

describe(computeHomeAccrued, () => {
  const RATE = 4;
  const LIMIT = 10;

  test("should produce whole units of the rate for the time elapsed, from what the store held", () => {
    expect.hasAssertions();

    expect(
      computeHomeAccrued(1, {
        elapsedSeconds: HOME_RATE_PERIOD_SECONDS + HOME_RATE_PERIOD_SECONDS / 2,
        limit: LIMIT,
        ratePerPeriod: RATE,
      }),
    ).toBe(1 + RATE + RATE / 2);
  });

  test("should hold no more than the store's limit", () => {
    expect.hasAssertions();

    expect(
      computeHomeAccrued(0, { elapsedSeconds: HOME_RATE_PERIOD_SECONDS * 10, limit: LIMIT, ratePerPeriod: RATE }),
    ).toBe(LIMIT);
  });

  test("should produce nothing for an elapsed span read below zero", () => {
    expect.hasAssertions();

    expect(computeHomeAccrued(2, { elapsedSeconds: -1, limit: LIMIT, ratePerPeriod: RATE })).toBe(2);
  });
});
