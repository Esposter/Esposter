import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { AchievementName } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("achievementDefinitions", () => {
  const achievementDefinitionNames = new Set(Object.keys(AchievementDefinitionMap) as AchievementName[]);
  const achievementNames = new Set(Object.values(AchievementName));

  test("should have a definition for every AchievementName", () => {
    expect.hasAssertions();

    expect(achievementDefinitionNames.difference(achievementNames)).toHaveLength(0);
  });
});
