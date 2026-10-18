import type { CookProudSkillRow } from "#src/models/genshinAssets/cooking/CookProudSkillRow";

import { toCookingTalent } from "#src/services/genshinAssets/cooking/toCookingTalent";
import { CookingFoodType, CookingTalentEffect } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toCookingTalent, () => {
  const GROUP_ID = 10;
  const createRow = (lifeEffectParams: string[], lifeEffectType?: string): CookProudSkillRow => ({
    lifeEffectParams,
    lifeEffectType,
    proudSkillGroupId: GROUP_ID,
  });

  test("a perfect cook's chance is read in percent, and its one kind of dish is the one its number names", () => {
    expect.hasAssertions();

    expect(toCookingTalent(createRow(["500", "2", "1", ""], "PROUD_EFFECT_COOK_PERFECT_MULTI_OUTPUT"))).toStrictEqual({
      chance: 5,
      effect: CookingTalentEffect.DoubleProduct,
      foodTypes: [CookingFoodType.Attack],
    });
  });

  test("a talent adding a suspicious dish names every kind of dish its list gives", () => {
    expect.hasAssertions();

    expect(toCookingTalent(createRow(["900", "1,3"], "PROUD_EFFECT_COOK_PROB_MULTI_OUTPUT"))).toStrictEqual({
      chance: 9,
      effect: CookingTalentEffect.SuspiciousDish,
      foodTypes: [CookingFoodType.Heal, CookingFoodType.Function],
    });
  });

  test("should throw for a food type its parameter names by a number the table does not give", () => {
    expect.hasAssertions();

    expect(() =>
      toCookingTalent(createRow(["500", "9"], "PROUD_EFFECT_COOK_PERFECT_MULTI_OUTPUT")),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 10, names no food type 9]`,
    );
  });
});
