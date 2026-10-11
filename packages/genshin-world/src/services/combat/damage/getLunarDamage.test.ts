import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { getLunarDamage } from "#src/services/combat/damage/getLunarDamage";
import { describe, expect, test } from "vitest";

describe(getLunarDamage, () => {
  test.each([
    [LunarReactionType.LunarBloom, 1],
    [LunarReactionType.LunarCharged, 3],
    [LunarReactionType.LunarCrystallize, 1.6],
  ])("multiplies %s's base by %f with no mastery or bonus", (lunarReactionType, coefficient) => {
    expect.hasAssertions();

    expect(getLunarDamage(lunarReactionType, 1000, 0, 0, 0)).toBe(1000 * coefficient);
  });

  test("raises the base by its Base DMG Bonus, and by 6 × EM / (EM + 2000) beside the reaction bonus", () => {
    expect.hasAssertions();

    expect(getLunarDamage(LunarReactionType.LunarCharged, 1000, 500, 0.14, 0.2)).toBeCloseTo(
      3 * 1000 * 1.14 * (1 + (6 * 500) / 2500 + 0.2),
    );
  });
});
