import type { ExcelTowerFloorRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerFloorRow";
import type { ExcelTowerLevelRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerLevelRow";

import { toAbyssFloor } from "#src/services/genshinAssets/spiralAbyss/toAbyssFloor";
import { describe, expect, test } from "vitest";

describe(toAbyssFloor, () => {
  const FLOOR_ID = 1001;
  const LEVEL_GROUP_ID = 1;
  const MONSTER_LEVEL = 24;
  const TEAM_COUNT = 2;
  const floorRow: ExcelTowerFloorRow = {
    floorId: FLOOR_ID,
    floorIndex: 1,
    levelGroupId: LEVEL_GROUP_ID,
    teamNum: TEAM_COUNT,
    unlockStarCount: 6,
  };
  const levelRow = (
    levelId: number,
    levelIndex: number,
    firstMonsterList: number[],
    secondMonsterList: number[],
  ): ExcelTowerLevelRow => ({
    conds: [],
    firstMonsterList,
    levelGroupId: LEVEL_GROUP_ID,
    levelId,
    levelIndex,
    monsterLevel: MONSTER_LEVEL,
    secondMonsterList,
    towerBuffConfigStrList: [],
  });

  test("a chamber's monster lists are its halves", () => {
    expect.hasAssertions();

    expect(
      toAbyssFloor(floorRow, [levelRow(11, 1, [21], [22]), levelRow(12, 2, [23], [24]), levelRow(13, 3, [25], [26])])
        .chambers[0],
    ).toStrictEqual({
      conditions: [],
      halfMonsterDescribeIds: [[21], [22]],
      id: 11,
      index: 1,
      monsterLevel: MONSTER_LEVEL,
    });
  });

  test("a chamber the dump lists no monsters for has no halves", () => {
    expect.hasAssertions();

    expect(
      toAbyssFloor(floorRow, [levelRow(11, 1, [], []), levelRow(12, 2, [], []), levelRow(13, 3, [], [])]).chambers[0],
    ).toStrictEqual({ conditions: [], halfMonsterDescribeIds: [], id: 11, index: 1, monsterLevel: MONSTER_LEVEL });
  });

  test("a chamber with fewer monster lists than its floor has teams is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toAbyssFloor(floorRow, [levelRow(11, 1, [21], []), levelRow(12, 2, [], []), levelRow(13, 3, [], [])]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 11, lists 1 halves for 2 teams]`,
    );
  });
});
