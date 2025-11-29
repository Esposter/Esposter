import type { UserAchievementWithDefinition } from "#shared/models/achievement/UserAchievementWithDefinition";
import type {
  AchievementDefinitionMap,
  achievementDefinitions as baseAchievementDefinitions,
} from "#shared/services/achievement/achievementDefinitions";
import type { AchievementName, UserAchievementWithRelations } from "@esposter/db-schema";

import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { mapToUserAchievementWithDefinition } from "@/services/achievement/mapToUserAchievementWithDefinition";

export const useAchievementStore = defineStore("achievement", () => {
  const achievementDefinitionMap = ref<typeof AchievementDefinitionMap>();
  const achievementDefinitions = computed<typeof baseAchievementDefinitions>(() =>
    achievementDefinitionMap.value ? parseDictionaryToArray(achievementDefinitionMap.value, "name") : [],
  );
  const initializeAchievementDefinitionMap = (newAchievementDefinitionMap: typeof AchievementDefinitionMap) => {
    achievementDefinitionMap.value = newAchievementDefinitionMap;
  };
  const userAchievements = ref<UserAchievementWithDefinition[]>([]);
  const stats = computed(() => {
    const achievementDefinitionMapValue = achievementDefinitionMap.value;
    if (!achievementDefinitionMapValue)
      return {
        totalAchievements: 0,
        totalPoints: 0,
        unlockedAchievements: 0,
        unlockedPoints: 0,
      };

    const unlockedAchievements = userAchievements.value.filter(({ unlockedAt }) => unlockedAt !== null);
    return {
      totalAchievements: achievementDefinitions.value.length,
      totalPoints: achievementDefinitions.value.reduce((total, { points }) => total + points, 0),
      unlockedAchievements: unlockedAchievements.length,
      unlockedPoints: unlockedAchievements.reduce(
        (total, { achievement: { name } }) => total + achievementDefinitionMapValue[name].points,
        0,
      ),
    };
  });
  const recentlyUnlockedUserAchievement = ref<null | UserAchievementWithDefinition>();
  const isAchievementUnlocked = (name: AchievementName): boolean => {
    const userAchievement = userAchievements.value.find(({ achievement }) => achievement.name === name);
    return userAchievement?.unlockedAt !== null;
  };
  const updateAchievement = (userAchievement: UserAchievementWithRelations) => {
    if (!achievementDefinitionMap.value) return;

    const userAchievementWithDefinition = mapToUserAchievementWithDefinition(
      userAchievement,
      achievementDefinitionMap.value[userAchievement.achievement.name],
    );
    const index = userAchievements.value.findIndex(({ id }) => id === userAchievement.id);
    if (index === -1) userAchievements.value.push(userAchievementWithDefinition);
    else userAchievements.value[index] = userAchievementWithDefinition;
    if (userAchievementWithDefinition.unlockedAt !== null)
      recentlyUnlockedUserAchievement.value = userAchievementWithDefinition;
  };
  return {
    achievementDefinitionMap,
    achievementDefinitions,
    initializeAchievementDefinitionMap,
    isAchievementUnlocked,
    recentlyUnlockedUserAchievement,
    stats,
    updateAchievement,
    userAchievements,
  };
});
