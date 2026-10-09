import type { ExcelDailyTaskRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskRow";

import { toCommissionTask } from "#src/services/genshinAssets/commissions/toCommissionTask";
import { describe, expect, test } from "vitest";

describe(toCommissionTask, () => {
  const ID = 10_100;
  const row: ExcelDailyTaskRow = {
    centerPosition: "Event_10100",
    cityId: 1,
    enterDistance: 40,
    exitDistance: 60,
    finishProgress: 8,
    finishType: "DAILY_FINISH_MONSTER_NUM",
    id: ID,
    newGroupVec: [133_003_474],
    oldGroupVec: [133_003_170],
    poolId: 1001,
    questId: 0,
    taskRewardId: 2,
    type: "DAILY_TASK_SCENE",
  };

  test("should read a scene task's kind, finish and groups, with no quest", () => {
    expect.hasAssertions();
    expect(toCommissionTask(row)).toStrictEqual({
      centerPosition: "Event_10100",
      enterDistance: 40,
      exitDistance: 60,
      finishKind: "Monster",
      finishProgress: 8,
      id: ID,
      kind: "Scene",
      newGroupIds: [133_003_474],
      oldGroupIds: [133_003_170],
      poolId: 1001,
      questId: "",
      rewardTier: 2,
    });
  });

  test("should refuse a finish the maps do not name", () => {
    expect.hasAssertions();
    expect(() => toCommissionTask({ ...row, finishType: "DAILY_FINISH_UNKNOWN" })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 10100, has the type DAILY_TASK_SCENE and the finish DAILY_FINISH_UNKNOWN, which the maps do not name]`,
    );
  });
});
