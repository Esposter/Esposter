import { getStellarConductElementalDmgBonus } from "#src/services/combat/damage/getStellarConductElementalDmgBonus";
import { describe, expect, test } from "vitest";

describe(getStellarConductElementalDmgBonus, () => {
  test("a field with no recorded hit gives a 20% Cryo and Electro DMG Bonus", () => {
    expect.hasAssertions();

    expect(getStellarConductElementalDmgBonus(0)).toBeCloseTo(0.2);
  });

  test("a field with recorded hits gives 28% plus 1% a hit", () => {
    expect.hasAssertions();

    expect(getStellarConductElementalDmgBonus(1)).toBeCloseTo(0.29);
    expect(getStellarConductElementalDmgBonus(12)).toBeCloseTo(0.4);
    expect(getStellarConductElementalDmgBonus(13)).toBeCloseTo(0.4);
  });
});
