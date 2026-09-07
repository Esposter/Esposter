import { authClient } from "@/services/auth/authClient";
import { useAchievementStore } from "@/store/achievement";
import { checkIsServer } from "@esposter/shared";

export const useAchievementSubscribables = async () => {
  if (checkIsServer()) return;

  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const achievementStore = useAchievementStore();
  const { updateAchievement } = achievementStore;
  const { data: session } = await authClient.useSession(useFetch);

  useOnlineSubscribable(
    () => session.value?.user.id,
    (userId) => {
      if (!userId) return undefined;

      const updateAchievementUnsubscribable = $trpc.achievement.onUpdateAchievement.subscribe(undefined, {
        onData: (achievements) => {
          for (const achievement of achievements) updateAchievement(achievement);
        },
      });
      return () => {
        updateAchievementUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
