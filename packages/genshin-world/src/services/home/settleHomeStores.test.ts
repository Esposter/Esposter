import type { HomeProgress } from "#src/models/home/HomeProgress";

import { HOME_RATE_PERIOD_SECONDS } from "#src/services/home/constants";
import { settleHomeStores } from "#src/services/home/settleHomeStores";
import { describe, expect, test } from "vitest";

describe(settleHomeStores, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const HALF_PERIOD_SECONDS = HOME_RATE_PERIOD_SECONDS / 2;
  const LIMIT = 10;
  const COMFORT = 0;
  const trustLevels = [{ bountyStoreLimit: LIMIT, coinStoreLimit: LIMIT, exp: 0, level: 1, npcCount: 2 }];
  const progress: HomeProgress = {
    claimedRewardIds: [],
    companionIds: [],
    learnedBlueprintIds: [],
    madeBlueprintIds: [],
    orders: [],
    realmBounty: 0,
    realmBountyAccruedAt: EPOCH,
    realmCurrency: 0,
    realmCurrencyAccruedAt: EPOCH,
    trustExp: 0,
  };

  test("a store keeps the time its whole units did not use for its next settle", () => {
    expect.hasAssertions();
    const options = {
      comfort: COMFORT,
      comfortLevels: [{ bountyRate: 0, coinRate: 1, comfort: COMFORT, level: 1 }],
      trustLevels,
    };

    const first = settleHomeStores(
      progress,
      EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS + HALF_PERIOD_SECONDS }),
      options,
    );
    const second = settleHomeStores(first, EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS * 2 }), options);

    expect(second.realmCurrency).toBe(2);
  });

  test("a settle of one store leaves the other store's unused time to its next settle", () => {
    expect.hasAssertions();
    const options = {
      comfort: COMFORT,
      comfortLevels: [{ bountyRate: 4, coinRate: 3, comfort: COMFORT, level: 1 }],
      trustLevels,
    };

    const first = settleHomeStores(progress, EPOCH.add({ seconds: HALF_PERIOD_SECONDS }), options);
    const second = settleHomeStores(first, EPOCH.add({ seconds: HOME_RATE_PERIOD_SECONDS }), options);

    expect(second.realmBounty).toBe(4);
    expect(second.realmCurrency).toBe(3);
  });
});
