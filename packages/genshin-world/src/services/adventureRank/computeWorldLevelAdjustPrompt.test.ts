import { computeWorldLevelAdjustPrompt } from "#src/services/adventureRank/computeWorldLevelAdjustPrompt";
import { describe, expect, test } from "vitest";

describe(computeWorldLevelAdjustPrompt, () => {
  const unlockedWorldLevel = 4;

  test("the prompt shows the World Level lowered by one", () => {
    expect.hasAssertions();

    expect(computeWorldLevelAdjustPrompt(unlockedWorldLevel, { isLowered: false })).toStrictEqual({
      adjustedWorldLevel: 3,
      currentWorldLevel: 4,
      isLowering: true,
    });
  });

  test("the prompt shows the World Level restored", () => {
    expect.hasAssertions();

    expect(computeWorldLevelAdjustPrompt(unlockedWorldLevel, { isLowered: true })).toStrictEqual({
      adjustedWorldLevel: 4,
      currentWorldLevel: 3,
      isLowering: false,
    });
  });
});
