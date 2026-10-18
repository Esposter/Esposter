import type { ExcelTowerScheduleRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerScheduleRow";

import { toAbyssPeriod } from "#src/services/genshinAssets/spiralAbyss/toAbyssPeriod";
import { describe, expect, test } from "vitest";

describe(toAbyssPeriod, () => {
  const SCHEDULE_ID = 1;
  const REWARD_GROUP = 2;
  const FLOOR_IDS = [1001, 1002];
  const row: ExcelTowerScheduleRow = {
    LHOGNLPBILP: [{ EFPMEPJHIKD: FLOOR_IDS, EHNDJIHDENA: "1970-01-01 00:00:00" }, {}],
    rewardGroup: REWARD_GROUP,
    scheduleId: SCHEDULE_ID,
  };

  test("should start the period at its first set's moment, reading the empty later set as none", () => {
    expect.hasAssertions();
    expect(toAbyssPeriod(row)).toStrictEqual({
      floorIds: FLOOR_IDS,
      id: SCHEDULE_ID,
      rewardGroup: REWARD_GROUP,
      startsAt: "1970-01-01T00:00:00",
    });
  });

  test("should refuse a first set with no moment rather than start the period at an empty time", () => {
    expect.hasAssertions();
    const momentless: ExcelTowerScheduleRow = { ...row, LHOGNLPBILP: [{ EFPMEPJHIKD: FLOOR_IDS }] };
    expect(() => toAbyssPeriod(momentless)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 1, has a first set with no floors or no start]`,
    );
  });
});
