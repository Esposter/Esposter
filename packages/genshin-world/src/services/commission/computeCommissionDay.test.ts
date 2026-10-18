import type { Commission } from "#src/models/commission/Commission";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { computeCommissionDay } from "#src/services/commission/computeCommissionDay";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(computeCommissionDay, () => {
  // The epoch is eight in the morning in the server's zone, four hours past that day's 04:00 reset
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const dailyReset = epoch.subtract({ hours: GAME_DAY_START_HOUR });
  const now = dailyReset.add({ hours: 12 });
  const RANK = 12;
  const commissions: Commission[] = [2, 3, 4, 5].map((id) => ({
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
    preferredRegion: "liyue",
    questId: "",
    rewardTier: 2,
  }));

  test("a day dealt before the daily reset is dealt again", () => {
    expect.hasAssertions();
    const day = {
      claimedCommissionIds: [1],
      dealtAt: dailyReset.subtract({ minutes: 1 }),
      dealtCommissions: [{ commissionId: 1, count: 3, dealtRank: RANK }],
    };
    const dealtDay = computeCommissionDay(day, now, commissions, new Set(), RANK, () => 0);
    expect(dealtDay.claimedCommissionIds).toStrictEqual([]);
    expect(dealtDay.dealtAt.toString()).toBe(now.toString());
    expect(
      dealtDay.dealtCommissions
        .map(({ commissionId }) => commissionId)
        .toSorted((firstCommissionId, secondCommissionId) => firstCommissionId - secondCommissionId),
    ).toStrictEqual([2, 3, 4, 5]);
  });

  test("a day dealt with no commissions is dealt again once the rank allows", () => {
    expect.hasAssertions();
    const day = { claimedCommissionIds: [], dealtAt: dailyReset, dealtCommissions: [] };
    const dealtDay = computeCommissionDay(day, now, commissions, new Set(), RANK, () => 0);
    expect(dealtDay.dealtCommissions).toHaveLength(4);
  });

  test("a day dealt at or after the daily reset is kept", () => {
    expect.hasAssertions();
    const day = {
      claimedCommissionIds: [],
      dealtAt: dailyReset,
      dealtCommissions: [{ commissionId: 2, count: 0, dealtRank: RANK }],
    };
    expect(computeCommissionDay(day, now, commissions, new Set(), RANK, () => 0)).toBe(day);
  });
});
