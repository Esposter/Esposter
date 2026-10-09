import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";

import { toTalentTables } from "#src/services/genshinAssets/stats/toTalentTables";
import { describe, expect, test } from "vitest";

describe(toTalentTables, () => {
  const GROUP_ID = 231;
  const OTHER_GROUP_ID = 999;
  const ROWS: ExcelProudSkillRow[] = [
    {
      breakLevel: 0,
      coinCost: 0,
      costItems: [],
      level: 2,
      paramDescList: [11, 12, 13],
      paramList: [0.5, 0, 0],
      proudSkillGroupId: GROUP_ID,
    },
    {
      breakLevel: 0,
      coinCost: 0,
      costItems: [],
      level: 1,
      paramDescList: [21, 22, 23],
      paramList: [0.25, 0.75, 0],
      proudSkillGroupId: GROUP_ID,
    },
    {
      breakLevel: 0,
      coinCost: 0,
      costItems: [],
      level: 1,
      paramDescList: [31],
      paramList: [0.1],
      proudSkillGroupId: OTHER_GROUP_ID,
    },
  ];

  test("keeps each named group's levels in order, its parameters up to the last one not zero, and its labels apart", () => {
    expect.hasAssertions();
    expect(toTalentTables(ROWS, new Set([GROUP_ID]))).toStrictEqual({
      labelMap: {
        [GROUP_ID]: [
          { level: 1, paramDescTextIds: [21, 22] },
          { level: 2, paramDescTextIds: [11] },
        ],
      },
      multiplierMap: {
        [GROUP_ID]: [
          { level: 1, paramList: [0.25, 0.75] },
          { level: 2, paramList: [0.5] },
        ],
      },
    });
  });
});
