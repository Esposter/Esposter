import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { computeEncounterPointStorage } from "#src/services/commission/computeEncounterPointStorage";
import { describe, expect, test } from "vitest";

const createCommission = (id: number): Commission => ({
  centerPosition: "",
  enterDistance: 0,
  exitDistance: 0,
  finishKind: CommissionFinishKind.Monster,
  finishProgress: 1,
  id,
  kind: CommissionKind.Quest,
  nameTextId: "",
  newGroupIds: [],
  oldGroupIds: [],
  poolId: 0,
  preferredRegion: "",
  questId: "",
  rewardTier: 0,
});
const COMMISSION_IDS = [1, 2, 3, 4];
const slice: CommissionSlice = {
  bonuses: [],
  rewardTiers: [],
  tasks: COMMISSION_IDS.map((id) => createCommission(id)),
};
// The day with its first `finishedCount` commissions finished
const createDay = (finishedCount: number): CommissionDay => ({
  claimedCommissionIds: [],
  dealtAt: Temporal.Instant.fromEpochMilliseconds(0),
  isBonusClaimed: false,
  dealtCommissions: COMMISSION_IDS.map((commissionId) => ({
    commissionId,
    count: commissionId <= finishedCount ? 1 : 0,
    dealtRank: 12,
  })),
});

describe(computeEncounterPointStorage, () => {
  test("the storage shrinks by one Encounter Point for each daily commission finished", () => {
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
