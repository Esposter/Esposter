import { getCrystallizeShieldHealth } from "#src/services/combat/shield/getCrystallizeShieldHealth";
import { describe, expect, test } from "vitest";

describe(getCrystallizeShieldHealth, () => {
  test("grants a level 90 character with no mastery a shield of 1851.06", () => {
    expect.hasAssertions();

    expect(getCrystallizeShieldHealth(90, 0)).toBeCloseTo(1851.06, 2);
  });

  test.each([
    [100, 0.296],
    [500, 1.168],
    [1000, 1.85],
  ])("raises the shield of a character with %i mastery by %f", (elementalMastery, bonus) => {
    expect.hasAssertions();

    expect(getCrystallizeShieldHealth(90, elementalMastery) / getCrystallizeShieldHealth(90, 0)).toBeCloseTo(
      1 + bonus,
      3,
    );
  });
});
