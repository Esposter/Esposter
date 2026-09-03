import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { toUserAchievementWithDefinition } from "@/services/achievement/toUserAchievementWithDefinition";

// The definition map defaults to the static one because the public profile serves signed-out visitors, who
// Cannot call the authed `readAchievementMap` — surfaces that can pass the viewer-masked map it returns
export const useReadUserAchievements = async (userId?: string, achievementDefinitionMap = AchievementDefinitionMap) => {
  const { $trpc } = useNuxtApp();
  const userAchievements = await $trpc.achievement.readUserAchievements.query(userId);
  return userAchievements.map((userAchievement) =>
    toUserAchievementWithDefinition(userAchievement, achievementDefinitionMap[userAchievement.achievement.name]),
  );
};
