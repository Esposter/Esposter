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
  const DEALT_AT = Temporal.Instant.fromEpochMilliseconds(0);
  const DEALT_RANK = 12;
  const FINISH_PROGRESS = 3;
  const MORA_ID = 202;
  const REWARD_TIER = 2;
  // Rank 12 is the third band, so the band's items name the one a claim paid from
  const rewardBands = emptyBands();
  rewardBands[2] = [{ itemId: MORA_ID, maxCount: 20, minCount: 10 }];
  const commissionOf = (id: number): Commission => ({
    centerPosition: `Event_${id}`,
    enterDistance: 40,
    exitDistance: 60,
    finishKind: CommissionFinishKind.Monster,
    finishProgress: FINISH_PROGRESS,
    id,
    kind: CommissionKind.Scene,
    nameTextId: "1",
    newGroupIds: [],
    oldGroupIds: [],
    poolId: 1001,
    preferredRegion: "mondstadt",
    questId: "",
    rewardTier: REWARD_TIER,
  });
  const slice: CommissionSlice = {
    bonuses: emptyBands(),
    rewardTiers: [{ bands: rewardBands, tier: REWARD_TIER }],
    tasks: [1, 2, 3, 4].map((id) => commissionOf(id)),
  };
  const dealtOf = (commissionId: number, count: number) => ({ commissionId, count, dealtRank: DEALT_RANK });

  test("should refuse an unfinished commission with no Encounter Point held", () => {
    expect.hasAssertions();
    const day: CommissionDay = {
      claimedCommissionIds: [],
      dealtAt: DEALT_AT,
      dealtCommissions: [dealtOf(1, FINISH_PROGRESS - 1)],
      isBonusClaimed: false,
    };
    expect(claimCommissionReward(day, 0, 1, slice, minimumRoll)).toBeUndefined();
  });

  test("should claim an unfinished commission's reward for one point, which it spends", () => {
    expect.hasAssertions();
    const day: CommissionDay = {
      claimedCommissionIds: [],
      dealtAt: DEALT_AT,
      dealtCommissions: [dealtOf(1, FINISH_PROGRESS - 1)],
      isBonusClaimed: false,
    };
    expect(claimCommissionReward(day, 2, 1, slice, minimumRoll)).toStrictEqual({
      day: {
        claimedCommissionIds: [1],
        dealtAt: DEALT_AT,
        dealtCommissions: [dealtOf(1, FINISH_PROGRESS - 1)],
        isBonusClaimed: false,
      },
      encounterPoints: 1,
      rewards: [{ count: 10, id: MORA_ID }],
    });
  });

  test("should claim a finished commission free, keeping the points held", () => {
    expect.hasAssertions();
    const day: CommissionDay = {
      claimedCommissionIds: [],
      dealtAt: DEALT_AT,
      dealtCommissions: [dealtOf(1, FINISH_PROGRESS)],
      isBonusClaimed: false,
    };
    expect(claimCommissionReward(day, 2, 1, slice, minimumRoll)?.encounterPoints).toBe(2);
  });

  test("should refuse a commission that is not dealt today", () => {
    expect.hasAssertions();
    const day: CommissionDay = {
      claimedCommissionIds: [],
      dealtAt: DEALT_AT,
      dealtCommissions: [dealtOf(1, FINISH_PROGRESS)],
      isBonusClaimed: false,
    };
    expect(claimCommissionReward(day, 0, 2, slice, minimumRoll)).toBeUndefined();
  });

  test("should pay the reward of the rank it was dealt at", () => {
    expect.hasAssertions();
    const day: CommissionDay = {
      claimedCommissionIds: [],
      dealtAt: DEALT_AT,
      dealtCommissions: [dealtOf(1, FINISH_PROGRESS)],
      isBonusClaimed: false,
    };
    expect(claimCommissionReward(day, 0, 1, slice, maximumRoll)).toStrictEqual({
      day: {
        claimedCommissionIds: [1],
        dealtAt: DEALT_AT,
        dealtCommissions: [dealtOf(1, FINISH_PROGRESS)],
        isBonusClaimed: false,
      },
      encounterPoints: 0,
      rewards: [{ count: 20, id: MORA_ID }],
    });
  });

  // Katheryne gives the bonus once the four are claimed, so the fourth claim's reward is all a claim pays
  test("should leave Katheryne's bonus unclaimed on the day's fourth claim", () => {
    expect.hasAssertions();
    const day: CommissionDay = {
      claimedCommissionIds: [2, 3, 4],
      dealtAt: DEALT_AT,
      dealtCommissions: [dealtOf(1, FINISH_PROGRESS), dealtOf(2, 0), dealtOf(3, 0), dealtOf(4, 0)],
      isBonusClaimed: false,
    };
    const claim = claimCommissionReward(day, 0, 1, slice, minimumRoll);
    expect(claim?.rewards).toStrictEqual([{ count: 10, id: MORA_ID }]);
    expect(claim?.day.claimedCommissionIds).toStrictEqual([2, 3, 4, 1]);
    expect(claim?.day.isBonusClaimed).toBe(false);
  });

  test("should refuse a commission claimed already", () => {
    expect.hasAssertions();
    const day: CommissionDay = {
      claimedCommissionIds: [1],
      dealtAt: DEALT_AT,
      dealtCommissions: [dealtOf(1, FINISH_PROGRESS)],
      isBonusClaimed: false,
    };
    expect(claimCommissionReward(day, 0, 1, slice, minimumRoll)).toBeUndefined();
  });
});
