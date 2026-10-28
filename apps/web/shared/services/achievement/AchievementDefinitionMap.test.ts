import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { AchievementName } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("achievementDefinitionMap", () => {
  const achievementDefinitionNames = new Set(Object.keys(AchievementDefinitionMap));
  // Re-derived here rather than exported beside the enum, because this assertion is the one reader of the set
  const achievementNames = new Set(Object.values(AchievementName));

  test("has a definition for every AchievementName", () => {
    expect.hasAssertions();

    expect(achievementDefinitionNames.difference(achievementNames)).toHaveLength(0);
    expect(achievementNames.difference(achievementDefinitionNames)).toHaveLength(0);
  });

  // The category is applied by defineAchievementDefinitionMap through a cast, so the type cannot vouch for it
  test("carries its declaring map's category onto every definition", () => {
    expect.hasAssertions();

    expect(Object.values(AchievementDefinitionMap).filter(({ category }) => !category)).toHaveLength(0);
  });
});
