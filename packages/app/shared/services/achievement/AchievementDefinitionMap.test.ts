import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { AchievementName, AchievementNames, EmailAchievementName } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("AchievementDefinitionMap", () => {
  const achievementDefinitionNames = new Set(Object.keys(AchievementDefinitionMap) as AchievementName[]);

  test("has a definition for every AchievementName", () => {
    expect.hasAssertions();

    expect(achievementDefinitionNames.difference(AchievementNames)).toHaveLength(0);
    expect(AchievementNames.difference(achievementDefinitionNames)).toHaveLength(0);
  });

  // The category is applied by defineAchievementDefinitionMap through a cast, so the type cannot vouch for it
  test("carries its declaring map's category onto every definition", () => {
    expect.hasAssertions();

    expect(Object.values(AchievementDefinitionMap).filter(({ category }) => !category)).toHaveLength(0);
    expect(AchievementDefinitionMap[EmailAchievementName.EmailMarketer].category).toBe(AchievementCategory.Email);
  });
});
