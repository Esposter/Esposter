import type { Commission } from "#src/models/commission/Commission";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { toHandbookDayCommissions } from "#src/services/handbook/toHandbookDayCommissions";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

const createCommission = (id: number, preferredRegion: string): Commission => ({
  centerPosition: `Event_${id}`,
  enterDistance: 40,
  exitDistance: 60,
  finishKind: CommissionFinishKind.Monster,
  finishProgress: 8,
  id,
  kind: CommissionKind.Scene,
  nameTextId: String(id),
  newGroupIds: [],
  oldGroupIds: [],
  poolId: 3001,
  preferredRegion,
  questId: "",
  rewardTier: 2,
});

describe(toHandbookDayCommissions, () => {
  const DEALT_AT = Temporal.Instant.fromEpochMilliseconds(0);
  const RANK = 12;
  const NO_POINTS = 0;
  const ONE_POINT = 1;
  const tasks = [createCommission(2, "liyue"), createCommission(3, "natlan"), createCommission(4, "mondstadt")];
  const slice = { bonuses: [], rewardTiers: [], tasks };

  test("the Commissions tab lists the day's four with the preferred region", () => {
    expect.hasAssertions();
    const day = {
      claimedCommissionIds: [],
      dealtAt: DEALT_AT,
      isBonusClaimed: false,
      dealtCommissions: [
        { commissionId: 3, count: 5, dealtRank: RANK },
        { commissionId: 2, count: 0, dealtRank: RANK },
        { commissionId: 4, count: 8, dealtRank: RANK },
      ],
    };
    expect(toHandbookDayCommissions(day, slice, NO_POINTS)).toStrictEqual([
      {
        commissionId: 3,
        isClaimable: false,
        isClaimed: false,
        nameTextId: "3",
        progress: 5,
        regionTextKey: GameTextKey.Natlan,
        total: 8,
      },
      {
        commissionId: 2,
        isClaimable: false,
        isClaimed: false,
        nameTextId: "2",
        progress: 0,
        regionTextKey: GameTextKey.Liyue,
        total: 8,
      },
      {
        commissionId: 4,
        isClaimable: true,
        isClaimed: false,
        nameTextId: "4",
        progress: 8,
        regionTextKey: GameTextKey.Mondstadt,
        total: 8,
      },
    ]);
  });

  test("an unfinished commission is claimable only with a whole Encounter Point held", () => {
    expect.hasAssertions();
    const day = {
      claimedCommissionIds: [],
      dealtAt: DEALT_AT,
      isBonusClaimed: false,
      dealtCommissions: [{ commissionId: 2, count: 0, dealtRank: RANK }],
    };
    expect(toHandbookDayCommissions(day, slice, ONE_POINT)[0]?.isClaimable).toBe(true);
    expect(toHandbookDayCommissions(day, slice, NO_POINTS)[0]?.isClaimable).toBe(false);
  });

  test("a claimed commission is claimed and not claimable", () => {
    expect.hasAssertions();
    const day = {
      claimedCommissionIds: [4],
      dealtAt: DEALT_AT,
      isBonusClaimed: false,
      dealtCommissions: [{ commissionId: 4, count: 8, dealtRank: RANK }],
    };
    expect(toHandbookDayCommissions(day, slice, ONE_POINT)).toStrictEqual([
      {
        commissionId: 4,
        isClaimable: false,
        isClaimed: true,
        nameTextId: "4",
        progress: 8,
        regionTextKey: GameTextKey.Mondstadt,
        total: 8,
      },
    ]);
  });
});
