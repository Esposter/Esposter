// @vitest-environment nuxt
import type { UserAchievementWithDefinition } from "#src/models/achievement/UserAchievementWithDefinition";

import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { useAchievementStore } from "#src/store/achievement/index";
import { EmailAchievementName } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useAchievementStore, () => {
  const userId = v7();
  const achievementId = v7();
  const epoch = new Date(0);
  const achievementDefinition = AchievementDefinitionMap[EmailAchievementName.EmailMarketer];
  // A user's achievement as the store holds it, at the version the write that left it made
  const createUserAchievement = (version: number, unlockedAt: Date | null): UserAchievementWithDefinition => ({
    achievement: { ...achievementDefinition, name: EmailAchievementName.EmailMarketer },
    achievementId,
    amount: 1,
    createdAt: epoch,
    deletedAt: null,
    unlockedAt,
    updatedAt: epoch,
    userId,
    version,
  });

  test("keeps an unlock a newer row brought when an older read lands after it", () => {
    expect.hasAssertions();

    const achievementStore = useAchievementStore();
    const { initializeUserAchievements } = achievementStore;
    const { statistics } = storeToRefs(achievementStore);
    initializeUserAchievements([createUserAchievement(2, epoch)]);
    initializeUserAchievements([createUserAchievement(1, null)]);

    expect(statistics.value.unlockedAchievements).toBe(1);
  });
});
