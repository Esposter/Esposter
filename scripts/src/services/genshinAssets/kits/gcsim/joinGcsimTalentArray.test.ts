import type { TalentMultiplierMap } from "genshin-world";

import { joinGcsimTalentArray } from "#src/services/genshinAssets/kits/gcsim/joinGcsimTalentArray";
import { describe, expect, test } from "vitest";

const talentMultiplierMap: TalentMultiplierMap = {
  10: [
    { level: 1, paramList: [0.5, 2] },
    { level: 2, paramList: [0.6, 2] },
  ],
  20: [
    { level: 1, paramList: [0.5, 0.25] },
    { level: 2, paramList: [0.6, 0.5] },
  ],
};

describe("joinGcsimTalentArray", () => {
  test("joins a row to the one parameter whose multiplier at every level is the row's value", () => {
    expect.hasAssertions();

    expect(joinGcsimTalentArray({ line: 1, rows: [[2, 2]] }, talentMultiplierMap, [10, 20])).toStrictEqual({
      index: 1,
      proudSkillGroupId: 10,
    });
    expect(joinGcsimTalentArray({ line: 1, rows: [[0.5, 0.6]] }, talentMultiplierMap, [10])).toStrictEqual({
      index: 0,
      proudSkillGroupId: 10,
    });
    expect(joinGcsimTalentArray({ line: 1, rows: [[0.5, 0.6]] }, talentMultiplierMap, [10, 20])).toBeUndefined();
    expect(joinGcsimTalentArray({ line: 1, rows: [[0.25, 0.5]] }, talentMultiplierMap, [10, 20])).toStrictEqual({
      index: 1,
      proudSkillGroupId: 20,
    });
  });

  test("joins to none where two rows read two parameters", () => {
    expect.hasAssertions();

    expect(
      joinGcsimTalentArray(
        {
          line: 1,
          rows: [
            [2, 2],
            [0.25, 0.5],
          ],
        },
        talentMultiplierMap,
        [10, 20],
      ),
    ).toBeUndefined();
  });
});
