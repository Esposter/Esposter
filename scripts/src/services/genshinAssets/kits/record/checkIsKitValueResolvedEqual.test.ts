import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";
import { describe, expect, test } from "vitest";

const TALENT_MULTIPLIER_MAP: KitTables["talentMultiplierMap"] = {
  // Its parameter one reads 40 at every level
  "1": [
    { level: 1, paramList: [7, 40] },
    { level: 2, paramList: [7, 40] },
  ],
  // Its parameter zero reads 1 at level one and 2 at level two
  "2": [
    { level: 1, paramList: [1] },
    { level: 2, paramList: [2] },
  ],
  // Its parameters zero and one read 10 at every level alike
  "3": [
    { level: 1, paramList: [10, 10] },
    { level: 2, paramList: [10, 10] },
  ],
};

describe(checkIsKitValueResolvedEqual, () => {
  test.each<[string, unknown, unknown, boolean]>([
    ["a reference reads as the number it gives at every level", { index: 1, proudSkillGroupId: 1 }, 40, true],
    ["a reference differs from a number it does not give at one level", { index: 0, proudSkillGroupId: 2 }, 1, false],
    ["two references differ at a level", { index: 0, proudSkillGroupId: 1 }, { index: 1, proudSkillGroupId: 1 }, false],
    [
      "two references of different indexes read the same at every level",
      { index: 0, proudSkillGroupId: 3 },
      { index: 1, proudSkillGroupId: 3 },
      true,
    ],
    [
      "two references with no difference at any level are equal",
      { index: 0, proudSkillGroupId: 1 },
      { index: 0, proudSkillGroupId: 1 },
      true,
    ],
    ["a reference to a talent the tables lack equals nothing", { index: 0, proudSkillGroupId: 9 }, 0, false],
    ["a number that is not a reference compares as it always does", 40, 41, false],
    ["an area compares by its fields", { angle: 1, height: 2, radius: 3 }, { angle: 1, height: 2, radius: 3 }, true],
  ])("compares when %s", (_case, left, right, expected) => {
    expect.hasAssertions();

    expect(checkIsKitValueResolvedEqual(left, right, TALENT_MULTIPLIER_MAP)).toBe(expected);
  });
});
