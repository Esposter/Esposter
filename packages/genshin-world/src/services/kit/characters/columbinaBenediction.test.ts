import { getBenedictionBaseDamageBonus } from "#src/services/kit/characters/columbinaBenediction";
import { describe, expect, test } from "vitest";

describe(getBenedictionBaseDamageBonus, () => {
  test("adds 0.2% of Base DMG for every 1,000 max HP", () => {
    expect(getBenedictionBaseDamageBonus(10_000)).toBeCloseTo(0.02);
    expect(getBenedictionBaseDamageBonus(17_500)).toBeCloseTo(0.035);
  });

  test("adds nothing at no max HP", () => {
    expect(getBenedictionBaseDamageBonus(0)).toBe(0);
  });

  test("stops at 7% from 35,000 max HP, as the benediction's text gives it", () => {
    expect(getBenedictionBaseDamageBonus(35_000)).toBeCloseTo(0.07);
    expect(getBenedictionBaseDamageBonus(60_000)).toBeCloseTo(0.07);
  });
});
