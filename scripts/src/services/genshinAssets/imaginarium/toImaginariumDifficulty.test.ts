import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";

import { toImaginariumDifficulty } from "#src/services/genshinAssets/imaginarium/toImaginariumDifficulty";
import { describe, expect, test } from "vitest";

describe(toImaginariumDifficulty, () => {
  test("carries a difficulty's acts and its cast's minimum and extra from the row", () => {
    expect.hasAssertions();

    const row: ExcelRoleCombatDifficultyRow = {
      actCount: 6,
      alternateCastExtra: 2,
      alternateCastMinimum: 6,
      difficultyId: 2,
      difficultyLevel: 2,
      levelFloor: 60,
    };

    expect(toImaginariumDifficulty(row)).toStrictEqual({
      actCount: 6,
      alternateCastExtra: 2,
      alternateCastMinimum: 6,
      id: 2,
      level: 2,
      levelFloor: 60,
    });
  });

  test("keeps the extra absent on a row the first seasons' dump leaves it out of", () => {
    expect.hasAssertions();

    const row: ExcelRoleCombatDifficultyRow = {
      actCount: 3,
      alternateCastMinimum: 2,
      difficultyId: 1,
      difficultyLevel: 1,
      levelFloor: 60,
    };

    expect(toImaginariumDifficulty(row).alternateCastExtra).toBeUndefined();
  });
});
