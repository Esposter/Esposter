import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { claimCommissionWithEncounterPoint } from "#src/services/commission/claimCommissionWithEncounterPoint";
import { COMMISSION_RANK_BAND_COUNT } from "#src/services/commission/constants";
import { describe, expect, test } from "vitest";

describe(claimCommissionWithEncounterPoint, () => {
  const DEALT_RANK = 12;
  const MORA_ID = 202;
  const REWARD_TIER = 2;
  const COMMISSION_ID = 1;
  const rewardBands = Array.from({ length: COMMISSION_RANK_BAND_COUNT }, (): RewardItem[] => []);
  rewardBands[2] = [{ itemId: MORA_ID, maxCount: 20, minCount: 10 }];
  const commission: Commission = {
    centerPosition: "Event_1",
    enterDistance: 40,
    exitDistance: 60,
    finishKind: CommissionFinishKind.Monster,
    finishProgress: 3,
    id: COMMISSION_ID,
    kind: CommissionKind.Scene,
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 1001,
    questId: "",
    rewardTier: REWARD_TIER,
  };
  const slice: CommissionSlice = {
    bonuses: Array.from({ length: COMMISSION_RANK_BAND_COUNT }, (): RewardItem[] => []),
    rewardTiers: [{ bands: rewardBands, tier: REWARD_TIER }],
    tasks: [commission],
  };
  const day: CommissionDay = {
    claimedCommissionIds: [],
    dealtCommissions: [{ commissionId: COMMISSION_ID, count: 0, dealtRank: DEALT_RANK }],
  };

  test("should refuse a claim with no Encounter Point held", () => {
    expect.hasAssertions();
    expect(claimCommissionWithEncounterPoint(day, 0, COMMISSION_ID, slice, DEALT_RANK, () => 0)).toBeUndefined();
  });

  test("should claim an unfinished commission's reward for one point, which it spends", () => {
    expect.hasAssertions();
    expect(claimCommissionWithEncounterPoint(day, 2, COMMISSION_ID, slice, DEALT_RANK, () => 0)).toStrictEqual({
      bonus: [],
      day: { ...day, claimedCommissionIds: [COMMISSION_ID] },
      encounterPoints: 1,
      rewards: [{ count: 10, id: MORA_ID }],
    });
  });
});
