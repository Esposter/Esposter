import type { Achievement, UserAchievement } from "@esposter/db-schema";

export const useAchievementStore = defineStore("achievement", () => {
  const achievements = ref<Achievement[]>([]);
  const userAchievements = ref<(UserAchievement & { achievement: Achievement })[]>([]);
  const stats = ref({
    totalAchievements: 0,
    totalPoints: 0,
    unlockedAchievements: 0,
    unlockedPoints: 0,
  });
  const recentlyUnlocked = ref<null | (UserAchievement & { achievement: Achievement })>(null);
  const unlockedAchievements = computed(() => userAchievements.value.filter((ua) => ua.unlockedAt !== null));
  const lockedAchievements = computed(() => userAchievements.value.filter((ua) => ua.unlockedAt === null));
  const isAchievementUnlocked = (achievementId: string): boolean => {
    const userAchievement = userAchievements.value.find((ua) => ua.achievementId === achievementId);
    return userAchievement?.unlockedAt !== null;
  };
  const getAchievementProgress = (achievementId: string) => {
    const userAchievement = userAchievements.value.find((ua) => ua.achievementId === achievementId);
    if (!userAchievement?.achievement.targetProgress) return { current: 0, target: 1 };
    return {
      current: userAchievement.points ?? 0,
      target: userAchievement.achievement.targetProgress,
    };
  };
  const getProgressPercentage = (achievementId: string): number => {
    const { current, target } = getAchievementProgress(achievementId);
    return Math.min(100, Math.round((current / target) * 100));
  };
  const handleUnlock = (data: { achievement: Achievement; userAchievement: UserAchievement }) => {
    const index = userAchievements.value.findIndex((ua) => ua.id === data.userAchievement.id);
    if (index === -1) userAchievements.value.push({ ...data.userAchievement, achievement: data.achievement });
    else userAchievements.value[index] = { ...data.userAchievement, achievement: data.achievement };

    recentlyUnlocked.value = { ...data.userAchievement, achievement: data.achievement };
    stats.value.unlockedAchievements += 1;
    stats.value.unlockedPoints += data.achievement.points;
    setTimeout(() => {
      if (recentlyUnlocked.value?.id === data.userAchievement.id) recentlyUnlocked.value = null;
    }, 5000);
  };
  return {
    achievements,
    getAchievementProgress,
    getProgressPercentage,
    handleUnlock,
    isAchievementUnlocked,
    lockedAchievements,
    recentlyUnlocked,
    stats,
    unlockedAchievements,
    userAchievements,
  };
});
