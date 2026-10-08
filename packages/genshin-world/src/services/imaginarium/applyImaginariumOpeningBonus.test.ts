import { applyImaginariumOpeningBonus } from "#src/services/imaginarium/applyImaginariumOpeningBonus";
import { describe, expect, test } from "vitest";

describe(applyImaginariumOpeningBonus, () => {
  test("should raise Max HP, ATK and DEF by a fifth rounded down and leave Elemental Mastery", () => {
    expect.hasAssertions();

    expect(applyImaginariumOpeningBonus({ attack: 51, defense: 50, elementalMastery: 30, maxHp: 801 })).toStrictEqual({
      attack: 61,
      defense: 60,
      elementalMastery: 30,
      maxHp: 961,
    });
  });
});
