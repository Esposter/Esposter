import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { COMMISSION_RANK_BAND_COUNT } from "#src/services/commission/constants";
import { takeKatheryneBonus } from "#src/services/commission/takeKatheryneBonus";
import { describe, expect, test } from "vitest";

const emptyBands = (): RewardItem[][] => Array.from({ length: COMMISSION_RANK_BAND_COUNT }, (): RewardItem[] => []);
const minimumRoll = () => 0;

describe(takeKatheryneBonus, () => {
  const DEALT_AT = Temporal.Instant.fromEpochMilliseconds(0);
  const MORA_ID = 202;
  const PRIMOGEM_ID = 201;
  // Rank 12 is the third band and rank 20 the fourth, so each band's items name which one the bonus was drawn for
  const bonusBands = emptyBands();
  bonusBands[2] = [{ itemId: MORA_ID, maxCount: 1, minCount: 1 }];
  bonusBands[3] = [{ itemId: PRIMOGEM_ID, maxCount: 20, minCount: 20 }];
  const slice: CommissionSlice = { bonuses: bonusBands, rewardTiers: [], tasks: [] };
  const dayOf = (claimedCommissionIds: number[], isBonusClaimed = false): CommissionDay => ({
    claimedCommissionIds,
    dealtAt: DEALT_AT,
    dealtCommissions: [],
    isBonusClaimed,
  });

  test("should refuse Katheryne's bonus before the day's four commissions are claimed", () => {
    expect.hasAssertions();
    expect(takeKatheryneBonus(dayOf([1, 2, 3]), slice, 20, minimumRoll)).toBeUndefined();
  });

  test("should draw the bonus of the rank held now, and mark the day's bonus claimed, once the four are claimed", () => {
    expect.hasAssertions();
    expect(takeKatheryneBonus(dayOf([1, 2, 3, 4]), slice, 20, minimumRoll)).toStrictEqual({
      bonus: [{ count: 20, id: PRIMOGEM_ID }],
      day: dayOf([1, 2, 3, 4], true),
    });
  });

  test("should refuse Katheryne's bonus once it is claimed", () => {
    expect.hasAssertions();
    expect(takeKatheryneBonus(dayOf([1, 2, 3, 4], true), slice, 20, minimumRoll)).toBeUndefined();
  });
});
