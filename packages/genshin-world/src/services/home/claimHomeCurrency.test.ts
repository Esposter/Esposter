import type { HomeProgress } from "#src/models/home/HomeProgress";

import { claimHomeCurrency } from "#src/services/home/claimHomeCurrency";
import { HOME_RATE_PERIOD_SECONDS } from "#src/services/home/constants";
import { describe, expect, test } from "vitest";

describe(claimHomeCurrency, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const BOUNTY_RATE = 6;
  const COIN_RATE = 4;
  const LIMIT = 10;
  const COMFORT = 0;
  const progress: HomeProgress = {
    accruedAt: EPOCH,
    companionIds: [],
    learnedBlueprintIds: [],
    madeBlueprintIds: [],
    orders: [],
    realmBounty: 0,
    realmCurrency: 0,
    trustExp: 0,
  };
  const options = {
    comfort: COMFORT,
    comfortLevels: [{ bountyRate: BOUNTY_RATE, coinRate: COIN_RATE, comfort: COMFORT, level: 1 }],
    trustLevels: [{ bountyStoreLimit: LIMIT, coinStoreLimit: LIMIT, exp: 0, level: 1, npcCount: 2 }],
  };

  test("a store fills over real time", () => {
    expect.hasAssertions();

    const now = EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS });

    const result = claimHomeCurrency(progress, now, options);

    expect(result.currency).toBe(COIN_RATE);
    expect(result.progress).toStrictEqual({ ...progress, accruedAt: now, realmBounty: BOUNTY_RATE });
  });

  test("a store stops at its limit", () => {
    expect.hasAssertions();

    const now = EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS * 3 });

    const result = claimHomeCurrency(progress, now, options);

    expect(result.currency).toBe(LIMIT);
  });

  test("a clock read earlier than the last claim produces nothing", () => {
    expect.hasAssertions();

    const lastClaim = EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS * 2 });
    const stored = { ...progress, accruedAt: lastClaim, realmCurrency: COIN_RATE };

    const result = claimHomeCurrency(stored, EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS }), options);

    expect(result.currency).toBe(COIN_RATE);
    expect(result.progress.accruedAt.equals(lastClaim)).toBe(true);
  });
});
