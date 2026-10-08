import type { Commission } from "#src/models/commission/Commission";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { COMMISSION_UNLOCK_RANK } from "#src/services/commission/constants";
import { dealCommissions } from "#src/services/commission/dealCommissions";
import { describe, expect, test } from "vitest";

const commissionOf = (id: number, centerPosition: string): Commission => ({
  centerPosition,
  enterDistance: 40,
  exitDistance: 60,
  finishKind: CommissionFinishKind.Monster,
  finishProgress: 8,
  id,
  kind: CommissionKind.Scene,
  newGroupIds: [],
  oldGroupIds: [],
  poolId: 1001,
  questId: "",
  rewardTier: 2,
});

describe(dealCommissions, () => {
  const RANK = 12;
  const commissions = [
    commissionOf(1, "Event_1"),
    commissionOf(2, "Event_2"),
    commissionOf(3, "Event_3"),
    commissionOf(4, "Event_4"),
    commissionOf(5, "Event_5"),
  ];

  test("should deal four distinct commissions at the rank it is dealt at", () => {
    expect.hasAssertions();
    expect(dealCommissions(commissions, new Set(), RANK, () => 0)).toStrictEqual([
      { commissionId: 1, count: 0, dealtRank: RANK },
      { commissionId: 2, count: 0, dealtRank: RANK },
      { commissionId: 3, count: 0, dealtRank: RANK },
      { commissionId: 4, count: 0, dealtRank: RANK },
    ]);
  });

  test("should never deal a commission whose place a quest holds", () => {
    expect.hasAssertions();
    const dealt = dealCommissions(commissions, new Set(["Event_1"]), RANK, () => 0);
    expect(dealt.map(({ commissionId }) => commissionId)).toStrictEqual([2, 3, 4, 5]);
  });

  test("should deal every commission there is when fewer than four are dealable", () => {
    expect.hasAssertions();
    const dealt = dealCommissions(commissions.slice(0, 2), new Set(), RANK, () => 0);
    expect(dealt.map(({ commissionId }) => commissionId)).toStrictEqual([1, 2]);
  });

  test("should deal nothing before commissions open at their Adventure Rank", () => {
    expect.hasAssertions();
    expect(dealCommissions(commissions, new Set(), COMMISSION_UNLOCK_RANK - 1, () => 0)).toStrictEqual([]);
  });
});
