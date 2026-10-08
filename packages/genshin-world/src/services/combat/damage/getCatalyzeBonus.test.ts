import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { getCatalyzeBonus } from "#src/services/combat/damage/getCatalyzeBonus";
import { describe, expect, test } from "vitest";

describe(getCatalyzeBonus, () => {
  test.each([
    [CatalyzeReactionType.Aggravate, 1663.88],
    [CatalyzeReactionType.Spread, 1808.57],
  ])("adds %s's %f to a level 90 character's hit with no mastery", (catalyzeReactionType, bonus) => {
    expect.hasAssertions();

    expect(getCatalyzeBonus(catalyzeReactionType, 90, 0)).toBeCloseTo(bonus, 2);
  });

  test("raises the bonus by 5 × EM / (EM + 1200)", () => {
    expect.hasAssertions();

    expect(getCatalyzeBonus(CatalyzeReactionType.Spread, 90, 300)).toBeCloseTo(1808.57 * (1 + (5 * 300) / 1500), 1);
  });
});
