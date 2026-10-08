import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";

import { toTalentUpgradeMap } from "#src/services/genshinAssets/stats/toTalentUpgradeMap";
import { describe, expect, test } from "vitest";

const GROUP_ID = 231;
const OTHER_GROUP_ID = 999;
const MATERIAL_ID = 104_323;
const ROWS: ExcelProudSkillRow[] = [
  { breakLevel: 0, coinCost: 0, costItems: [], level: 1, proudSkillGroupId: GROUP_ID },
  {
    breakLevel: 2,
    coinCost: 12_500,
    costItems: [
      { count: 3, id: MATERIAL_ID },
      { count: 0, id: 0 },
    ],
    level: 2,
    proudSkillGroupId: GROUP_ID,
  },
  { breakLevel: 6, coinCost: 0, costItems: [], level: 11, proudSkillGroupId: GROUP_ID },
  { breakLevel: 2, coinCost: 12_500, costItems: [], level: 2, proudSkillGroupId: OTHER_GROUP_ID },
];

describe(toTalentUpgradeMap, () => {
  test("keeps each named group's levels from the second up to the materials' last, with its filled cost slots", () => {
    expect.hasAssertions();
    expect(toTalentUpgradeMap(ROWS, new Set([GROUP_ID]))).toStrictEqual({
      [GROUP_ID]: [{ coinCost: 12_500, costItems: [{ count: 3, id: MATERIAL_ID }], level: 2, phase: 2 }],
    });
  });
});
