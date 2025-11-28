import type {
  AchievementDefinitionMap,
  achievementDefinitions as baseAchievementDefinitions,
} from "@@/server/services/achievement/achievementDefinitions";
import type { UserAchievementWithRelations } from "@esposter/db-schema";

import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";

export const useAchievementStore = defineStore("achievement", () => {
  const achievementDefinitionMap = ref<typeof AchievementDefinitionMap>();
  const achievementDefinitions = computed<typeof baseAchievementDefinitions>(() =>
    achievementDefinitionMap.value ? parseDictionaryToArray(achievementDefinitionMap.value, "name") : [],
  );
  const initializeAchievementDefinitionMap = (newAchievementDefinitionMap: typeof AchievementDefinitionMap) => {
    achievementDefinitionMap.value = newAchievementDefinitionMap;
  };
  const userAchievements = ref<UserAchievementWithRelations[]>([]);
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
  const recentlyUnlockedUserAchievement = ref<null | UserAchievementWithRelations>();
  const unlockedAchievements = computed(() => userAchievements.value.filter(({ unlockedAt }) => unlockedAt !== null));
  const lockedAchievements = computed(() => userAchievements.value.filter(({ unlockedAt }) => unlockedAt === null));
  const isAchievementUnlocked = (id: string): boolean => {
    const userAchievement = userAchievements.value.find(({ achievementId }) => achievementId === id);
    return userAchievement?.unlockedAt !== null;
  };
  const unlockAchievement = (userAchievement: UserAchievementWithRelations) => {
    const index = userAchievements.value.findIndex(({ id }) => id === userAchievement.id);
    if (index === -1) userAchievements.value.push({ ...userAchievement });
    else userAchievements.value[index] = { ...userAchievement };
    recentlyUnlockedUserAchievement.value = userAchievement;
  };
  return {
    achievementDefinitionMap,
    achievementDefinitions,
    initializeAchievementDefinitionMap,
    isAchievementUnlocked,
    lockedAchievements,
    recentlyUnlockedUserAchievement,
    stats,
    unlockAchievement,
    unlockedAchievements,
    userAchievements,
  };
});
