import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { claimCommissionReward } from "#src/services/commission/claimCommissionReward";
import { COMMISSION_RANK_BAND_COUNT } from "#src/services/commission/constants";
import { describe, expect, test } from "vitest";

const emptyBands = (): RewardItem[][] => Array.from({ length: COMMISSION_RANK_BAND_COUNT }, (): RewardItem[] => []);
const minimumRoll = () => 0;
const maximumRoll = () => 0.999;

describe(claimCommissionReward, () => {
  const DEALT_RANK = 12;
  const CURRENT_RANK = 20;
  const FINISH_PROGRESS = 3;
  const MORA_ID = 202;
  const PRIMOGEM_ID = 201;
  const REWARD_TIER = 2;
  // Rank 12 is the third band and rank 20 the fourth, so each band's items name which one a claim paid from
  const rewardBands = emptyBands();
  rewardBands[2] = [{ itemId: MORA_ID, maxCount: 20, minCount: 10 }];
  const bonusBands = emptyBands();
  bonusBands[2] = [{ itemId: MORA_ID, maxCount: 1, minCount: 1 }];
  bonusBands[3] = [{ itemId: PRIMOGEM_ID, maxCount: 20, minCount: 20 }];
  const commissionOf = (id: number): Commission => ({
    centerPosition: `Event_${id}`,
    enterDistance: 40,
    exitDistance: 60,
    finishKind: CommissionFinishKind.Monster,
    finishProgress: FINISH_PROGRESS,
    id,
    kind: CommissionKind.Scene,
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 1001,
    questId: "",
    rewardTier: REWARD_TIER,
  });
  const slice: CommissionSlice = {
    bonuses: bonusBands,
    rewardTiers: [{ bands: rewardBands, tier: REWARD_TIER }],
    tasks: [1, 2, 3, 4].map((id) => commissionOf(id)),
  };
  const dealtOf = (commissionId: number, count: number) => ({ commissionId, count, dealtRank: DEALT_RANK });

  test("should refuse a commission that is not finished", () => {
    expect.hasAssertions();
    const day: CommissionDay = { claimedCommissionIds: [], dealtCommissions: [dealtOf(1, FINISH_PROGRESS - 1)] };
    expect(claimCommissionReward(day, 0, 1, slice, CURRENT_RANK, minimumRoll)).toBeUndefined();
  });

  test("should refuse a commission that is not dealt today", () => {
    expect.hasAssertions();
    const day: CommissionDay = { claimedCommissionIds: [], dealtCommissions: [dealtOf(1, FINISH_PROGRESS)] };
    expect(claimCommissionReward(day, 0, 2, slice, CURRENT_RANK, minimumRoll)).toBeUndefined();
  });

  test("should pay the reward of the rank it was dealt at, and no bonus before the day's fourth claim", () => {
    expect.hasAssertions();
    const day: CommissionDay = { claimedCommissionIds: [], dealtCommissions: [dealtOf(1, FINISH_PROGRESS)] };
    expect(claimCommissionReward(day, 0, 1, slice, CURRENT_RANK, maximumRoll)).toStrictEqual({
      bonus: [],
      day: { claimedCommissionIds: [1], dealtCommissions: [dealtOf(1, FINISH_PROGRESS)] },
      encounterPoints: 0,
      rewards: [{ count: 20, id: MORA_ID }],
    });
  });

  test("should pay Katheryne's bonus of the rank held now on the day's fourth claim", () => {
    expect.hasAssertions();
    const day: CommissionDay = {
      claimedCommissionIds: [2, 3, 4],
      dealtCommissions: [dealtOf(1, FINISH_PROGRESS), dealtOf(2, 0), dealtOf(3, 0), dealtOf(4, 0)],
    };
    const claim = claimCommissionReward(day, 0, 1, slice, CURRENT_RANK, minimumRoll);
    expect(claim?.bonus).toStrictEqual([{ count: 20, id: PRIMOGEM_ID }]);
    expect(claim?.rewards).toStrictEqual([{ count: 10, id: MORA_ID }]);
    expect(claim?.day.claimedCommissionIds).toStrictEqual([2, 3, 4, 1]);
  });

  test("should refuse a commission claimed already", () => {
    expect.hasAssertions();
    const day: CommissionDay = { claimedCommissionIds: [1], dealtCommissions: [dealtOf(1, FINISH_PROGRESS)] };
    expect(claimCommissionReward(day, 0, 1, slice, CURRENT_RANK, minimumRoll)).toBeUndefined();
  });
});
