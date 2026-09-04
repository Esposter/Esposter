import type { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import type { achievementDefinitions as baseAchievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";
import type { AchievementName, UserAchievementWithRelations } from "@esposter/db-schema";

import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { getUnlockedUserAchievements } from "@/services/achievement/getUnlockedUserAchievements";
import { toUserAchievementWithDefinition } from "@/services/achievement/toUserAchievementWithDefinition";

export const useAchievementStore = defineStore("achievement", () => {
  const achievementDefinitionMap = ref<typeof AchievementDefinitionMap>();
  const achievementDefinitions = computed<typeof baseAchievementDefinitions>(() =>
    achievementDefinitionMap.value ? parseDictionaryToArray(achievementDefinitionMap.value, "name") : [],
  );
  const initializeAchievementDefinitionMap = (newAchievementDefinitionMap: typeof AchievementDefinitionMap) => {
    achievementDefinitionMap.value = newAchievementDefinitionMap;
  };
  const userAchievements = ref<UserAchievementWithDefinition[]>([]);
  const statistics = computed(() => {
    const unlockedUserAchievements = getUnlockedUserAchievements(userAchievements.value);
    return {
      totalAchievements: achievementDefinitions.value.length,
      totalPoints: achievementDefinitions.value.reduce((total, { points }) => total + points, 0),
      unlockedAchievements: unlockedUserAchievements.length,
      unlockedPoints: unlockedUserAchievements.reduce((total, { achievement: { points } }) => total + points, 0),
    };
  });
  const recentlyUnlockedUserAchievements = ref<UserAchievementWithDefinition[]>([]);
  const deleteRecentlyUnlockedUserAchievement = (name: AchievementName) => {
    recentlyUnlockedUserAchievements.value = recentlyUnlockedUserAchievements.value.filter(
      ({ achievement }) => achievement.name !== name,
    );
  };
  const updateAchievement = (updatedUserAchievement: UserAchievementWithRelations) => {
    if (!achievementDefinitionMap.value) return;

    const userAchievementWithDefinition = toUserAchievementWithDefinition(
      updatedUserAchievement,
      achievementDefinitionMap.value[updatedUserAchievement.achievement.name],
    );
    const index = userAchievements.value.findIndex(
      ({ achievementId, userId }) =>
        userId === updatedUserAchievement.userId && achievementId === updatedUserAchievement.achievementId,
    );
    if (index === -1) userAchievements.value.push(userAchievementWithDefinition);
    else userAchievements.value[index] = userAchievementWithDefinition;
    if (userAchievementWithDefinition.unlockedAt !== null)
      recentlyUnlockedUserAchievements.value.push(userAchievementWithDefinition);
  };
  return {
    achievementDefinitions,
    deleteRecentlyUnlockedUserAchievement,
    initializeAchievementDefinitionMap,
    recentlyUnlockedUserAchievements,
    statistics,
    updateAchievement,
    userAchievements,
  };
});
