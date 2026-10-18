import { getStellarConductElementalDamageBonus } from "#src/services/combat/damage/getStellarConductElementalDamageBonus";
import { describe, expect, test } from "vitest";

describe(getStellarConductElementalDamageBonus, () => {
  test("a field with no recorded hit gives a 20% Cryo and Electro DMG Bonus", () => {
    expect.hasAssertions();

    expect(getStellarConductElementalDamageBonus(0)).toBeCloseTo(0.2);
  });

  test("a field with recorded hits gives 28% plus 1% a hit", () => {
    expect.hasAssertions();

    expect(getStellarConductElementalDamageBonus(1)).toBeCloseTo(0.29);
    expect(getStellarConductElementalDamageBonus(12)).toBeCloseTo(0.4);
    expect(getStellarConductElementalDamageBonus(13)).toBeCloseTo(0.4);
  });
});
