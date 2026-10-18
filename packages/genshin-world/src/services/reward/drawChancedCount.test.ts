import { drawChancedCount } from "#src/services/reward/drawChancedCount";
import { describe, expect, test } from "vitest";

describe(drawChancedCount, () => {
  test("a roll under the chance adds one more to the guaranteed count", () => {
    expect.hasAssertions();

    expect(drawChancedCount({ chance: 0.5, guaranteedCount: 2 }, () => 0.49)).toBe(3);
  });

  test("a roll at or above the chance leaves the guaranteed count alone", () => {
    expect.hasAssertions();

    expect(drawChancedCount({ chance: 0.5, guaranteedCount: 2 }, () => 0.5)).toBe(2);
  });
});
