import type { WatchHandle } from "vue";

import { authClient } from "@/services/auth/authClient";
import { useAchievementStore } from "@/store/achievement";

export const useAchievementSubscribables = async () => {
  const { $trpc } = useNuxtApp();
  const achievementStore = useAchievementStore();
  const { updateAchievement } = achievementStore;
  const { data: session } = await authClient.useSession(useFetch);
  let watchHandle: undefined | WatchHandle;

  onMounted(() => {
    watchHandle = watchImmediate(
      () => session.value?.user.id,
      (userId) => {
        if (!userId) return;

        const updateAchievementUnsubscribable = $trpc.achievement.onUpdateAchievement.subscribe(undefined, {
          onData: (data) => {
            updateAchievement(data);
          },
        });
        return () => {
          updateAchievementUnsubscribable.unsubscribe();
        };
      },
    );
  });

  onUnmounted(() => {
    watchHandle?.();
  });
};
