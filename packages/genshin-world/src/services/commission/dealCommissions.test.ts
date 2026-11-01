import { COMMISSION_UNLOCK_RANK } from "#src/services/commission/constants";
import { createCommission } from "#src/services/commission/createCommission.test";
import { dealCommissions } from "#src/services/commission/dealCommissions";
import { describe, expect, test } from "vitest";

describe(dealCommissions, () => {
  const RANK = 12;
  const commissions = [
    createCommission(1),
    createCommission(2),
    createCommission(3),
    createCommission(4),
    createCommission(5),
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

  test("a commission is not dealt where a quest in progress stands", () => {
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
