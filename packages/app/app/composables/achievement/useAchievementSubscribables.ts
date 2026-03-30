import { authClient } from "@/services/auth/authClient";
import { useAchievementStore } from "@/store/achievement";

export const useAchievementSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const achievementStore = useAchievementStore();
  const { updateAchievement } = achievementStore;
  const session = authClient.useSession();

  useOnlineSubscribable(
    () => session.value.data?.user.id,
    (userId) => {
      if (!userId) return;

      const updateAchievementUnsubscribable = $trpc.achievement.onUpdateAchievement.subscribe(undefined, {
        onData: (data) => {
          for (const achievement of data) updateAchievement(achievement);
        },
      });
      return () => {
        updateAchievementUnsubscribable.unsubscribe();
      };
    },
  );
};
