import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { describe, expect, test } from "vitest";

describe(getResistanceMultiplier, () => {
  test.each([
    [-0.2, 1.1],
    [0, 1],
    [0.1, 0.9],
    [0.75, 0.25],
    [1, 0.2],
  ])("leaves a resistance of %f taking %f of the damage", (resistance, multiplier) => {
    expect.hasAssertions();

    expect(getResistanceMultiplier(resistance)).toBeCloseTo(multiplier);
  });
});
