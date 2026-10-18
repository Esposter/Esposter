import { getStellarVortexCoefficient } from "#src/services/combat/damage/getStellarVortexCoefficient";
import { describe, expect, test } from "vitest";

describe(getStellarVortexCoefficient, () => {
  test("a Stellar Vortex explodes at a coefficient of 2 for its first two stacks", () => {
    expect.hasAssertions();

    expect(getStellarVortexCoefficient(1)).toBe(2);
    expect(getStellarVortexCoefficient(2)).toBe(2);
  });

  test("a Stellar Vortex explodes at a coefficient of 3 from its third stack", () => {
    expect.hasAssertions();

    expect(getStellarVortexCoefficient(3)).toBe(3);
    expect(getStellarVortexCoefficient(6)).toBe(3);
  });

  test("a Stellar Vortex with no stack explodes at nothing", () => {
    expect.hasAssertions();

    expect(getStellarVortexCoefficient(0)).toBe(0);
  });
});
