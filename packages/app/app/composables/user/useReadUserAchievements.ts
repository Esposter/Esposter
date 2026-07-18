import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { mapToUserAchievementWithDefinition } from "@/services/achievement/mapToUserAchievementWithDefinition";

export const useReadUserAchievements = async (userId: string) => {
  const { $trpc } = useNuxtApp();
  const userAchievements = await $trpc.achievement.readUserAchievements.query(userId);
  return userAchievements.map((userAchievement) =>
    mapToUserAchievementWithDefinition(userAchievement, AchievementDefinitionMap[userAchievement.achievement.name]),
  );
};
