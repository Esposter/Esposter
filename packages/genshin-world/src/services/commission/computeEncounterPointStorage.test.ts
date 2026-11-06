import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { CommissionKind } from "#src/models/commission/CommissionKind";
import { computeEncounterPointStorage } from "#src/services/commission/computeEncounterPointStorage";
import { createCommission } from "#src/services/commission/createCommission.test";
import { describe, expect, test } from "vitest";

describe(computeEncounterPointStorage, () => {
  const COMMISSION_IDS = [1, 2, 3, 4];
  const slice: CommissionSlice = {
    bonuses: [],
    rewardTiers: [],
    tasks: COMMISSION_IDS.map((id) =>
      createCommission(id, {
        centerPosition: "",
        enterDistance: 0,
        exitDistance: 0,
        finishProgress: 1,
        kind: CommissionKind.Quest,
        nameTextId: "",
        poolId: 0,
        preferredRegion: "",
        rewardTier: 0,
      }),
    ),
  };
  // The day with its first `finishedCount` commissions finished
  const createDay = (finishedCount: number): CommissionDay => ({
    claimedCommissionIds: [],
    dealtAt: Temporal.Instant.fromEpochMilliseconds(0),
    dealtCommissions: COMMISSION_IDS.map((commissionId) => ({
      commissionId,
      count: commissionId <= finishedCount ? 1 : 0,
      dealtRank: 12,
    })),
    isBonusClaimed: false,
  });

  test("the storage shrinks by one for each daily commission finished", () => {
    expect.hasAssertions();
    expect(computeEncounterPointStorage(createDay(0), slice)).toBe(8);
    expect(computeEncounterPointStorage(createDay(2), slice)).toBe(4);
    expect(computeEncounterPointStorage(createDay(4), slice)).toBe(0);
  });

  test("a day read with no slice finishes none, so the storage is the full four", () => {
    expect.hasAssertions();
    expect(computeEncounterPointStorage(createDay(4), undefined)).toBe(8);
  });
});
