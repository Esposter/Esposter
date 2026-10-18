import type { Commission } from "#src/models/commission/Commission";

import { CommissionFinishKind } from "#src/models/commission/CommissionFinishKind";
import { CommissionKind } from "#src/models/commission/CommissionKind";
import { computeCommissionDay } from "#src/services/commission/computeCommissionDay";
import { DAILY_RESET_TIME } from "#src/services/enemy/constants";
import { describe, expect, test } from "vitest";

describe(computeCommissionDay, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
  const dailyReset = epoch.toPlainDate().toZonedDateTime({ plainTime: DAILY_RESET_TIME, timeZone: "UTC" });
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
      dealtAt: dailyReset.subtract({ minutes: 1 }).toInstant(),
      dealtCommissions: [{ commissionId: 1, count: 3, dealtRank: RANK }],
    };
    const dealtDay = computeCommissionDay(day, now, commissions, new Set(), RANK, () => 0);
    expect(dealtDay.claimedCommissionIds).toStrictEqual([]);
    expect(dealtDay.dealtAt).toStrictEqual(now.toInstant());
    expect(dealtDay.dealtCommissions.map(({ commissionId }) => commissionId).toSorted((a, b) => a - b)).toStrictEqual([
      2, 3, 4, 5,
    ]);
  });

  test("a day dealt with no commissions is dealt again once the rank allows", () => {
    expect.hasAssertions();
    const day = { claimedCommissionIds: [], dealtAt: dailyReset.toInstant(), dealtCommissions: [] };
    const dealtDay = computeCommissionDay(day, now, commissions, new Set(), RANK, () => 0);
    expect(dealtDay.dealtCommissions).toHaveLength(4);
  });

  test("a day dealt at or after the daily reset is kept", () => {
    expect.hasAssertions();
    const day = {
      claimedCommissionIds: [],
      dealtAt: dailyReset.toInstant(),
      dealtCommissions: [{ commissionId: 2, count: 0, dealtRank: RANK }],
    };
    expect(computeCommissionDay(day, now, commissions, new Set(), RANK, () => 0)).toBe(day);
  });
});
