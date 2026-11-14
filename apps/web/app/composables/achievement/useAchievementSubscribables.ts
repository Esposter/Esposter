import { useAchievementStore } from "@/store/achievement";
import { useConnectionStore } from "@/store/realtime/connection";
import { checkIsServer } from "@esposter/shared";

export const useAchievementSubscribables = () => {
  if (checkIsServer()) return;

  const achievementStore = useAchievementStore();
  const { updateAchievement } = achievementStore;
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;
  const unregister = onUserEvent("updateAchievement", (achievements) => {
    for (const achievement of achievements) updateAchievement(achievement);
  });
  onScopeDispose(unregister);
};
