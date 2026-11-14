import type { UserAchievementInAchievementWithRelations } from "@esposter/db-schema";

import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { toUserAchievementWithDefinition } from "@/services/achievement/toUserAchievementWithDefinition";
import { EmailAchievementName } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(toUserAchievementWithDefinition, () => {
  const achievementDefinition = AchievementDefinitionMap[EmailAchievementName.EmailMarketer];
  const userAchievement = {
    achievement: { name: EmailAchievementName.EmailMarketer },
    achievementId: v7(),
    amount: 1,
    unlockedAt: new Date(0),
    userId: v7(),
  } as UserAchievementInAchievementWithRelations;

  test("keeps the row's own progress and gives the achievement the definition's fields", () => {
    expect.hasAssertions();

    const result = toUserAchievementWithDefinition(userAchievement, achievementDefinition);

    expect(result.amount).toBe(1);
    expect(result.unlockedAt).toStrictEqual(new Date(0));
    expect(result.achievement.points).toBe(achievementDefinition.points);
    expect(result.achievement.name).toBe(EmailAchievementName.EmailMarketer);
  });
});
