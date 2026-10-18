import { computeHomeAccrued } from "#src/services/home/computeHomeAccrued";
import { HOME_RATE_PERIOD_SECONDS } from "#src/services/home/constants";
import { describe, expect, test } from "vitest";

describe(computeHomeAccrued, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const RATE = 4;
  const LIMIT = 10;

  test("should produce whole units of the rate for the time elapsed, from what the store held", () => {
    expect.hasAssertions();

    expect(
      computeHomeAccrued(1, EPOCH, EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS + HOME_RATE_PERIOD_SECONDS / 2 }), {
        limit: LIMIT,
        ratePerPeriod: RATE,
      }).amount,
    ).toBe(1 + RATE + RATE / 2);
  });

  test("should move its accrued instant past the time its whole units took, carrying the rest", () => {
    expect.hasAssertions();

    const result = computeHomeAccrued(0, EPOCH, EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS / 2 }), {
      limit: LIMIT,
      ratePerPeriod: 3,
    });

    expect(result.amount).toBe(1);
    expect(result.accruedAt.equals(EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS / 3 }))).toBe(true);
  });

  test("should hold no more than the store's limit, and accrue to now", () => {
    expect.hasAssertions();

    const now = EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS * 10 });
    const result = computeHomeAccrued(0, EPOCH, now, { limit: LIMIT, ratePerPeriod: RATE });

    expect(result.amount).toBe(LIMIT);
    expect(result.accruedAt.equals(now)).toBe(true);
  });

  test("should produce nothing for an elapsed span read below zero", () => {
    expect.hasAssertions();

    const result = computeHomeAccrued(2, EPOCH, EPOCH.subtract({ seconds: 1 }), { limit: LIMIT, ratePerPeriod: RATE });

    expect(result.amount).toBe(2);
    expect(result.accruedAt.equals(EPOCH)).toBe(true);
  });
});
