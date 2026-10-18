import type { ItemCount } from "#src/models/inventory/ItemCount";

import { claimFirstClearReward } from "#src/services/domains/claimFirstClearReward";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

describe(claimFirstClearReward, () => {
  const DOMAIN_ID = "1";
  const MORA_COUNT = 12_000;
  const rewards: ItemCount[] = [{ count: MORA_COUNT, id: MORA_ITEM_ID }];

  test("a first clear gives the rewards and keeps the domain cleared", () => {
    expect.hasAssertions();

    expect(claimFirstClearReward(new Set(), DOMAIN_ID, rewards)).toStrictEqual({
      clearedDomainIds: new Set([DOMAIN_ID]),
      rewards,
    });
  });

  test("a repeat clear of a one-time domain gives nothing", () => {
    expect.hasAssertions();

    expect(claimFirstClearReward(new Set([DOMAIN_ID]), DOMAIN_ID, rewards)).toStrictEqual({
      clearedDomainIds: new Set([DOMAIN_ID]),
      rewards: [],
    });
  });
});
