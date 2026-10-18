import { getStellarConductCoefficient } from "#src/services/combat/damage/getStellarConductCoefficient";
import { describe, expect, test } from "vitest";

describe(getStellarConductCoefficient, () => {
  test("a recorded hit raises the Stellar-Conduct's coefficient", () => {
    expect.hasAssertions();

    expect(getStellarConductCoefficient(0)).toBe(1);
    expect(getStellarConductCoefficient(1)).toBeCloseTo(1.45);
    expect(getStellarConductCoefficient(2)).toBeCloseTo(1.5);
  });

  test("the coefficient stops rising at 12 recorded hits", () => {
    expect.hasAssertions();

    expect(getStellarConductCoefficient(12)).toBeCloseTo(2);
    expect(getStellarConductCoefficient(13)).toBeCloseTo(2);
  });
});
