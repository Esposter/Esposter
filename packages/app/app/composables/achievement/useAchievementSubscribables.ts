import type { WatchHandle } from "vue";

import { authClient } from "@/services/auth/authClient";
import { useAchievementStore } from "@/store/achievement";

export const useAchievementSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const achievementStore = useAchievementStore();
  const { updateAchievement } = achievementStore;
  const session = authClient.useSession();
  let watchHandle: undefined | WatchHandle;

  onMounted(() => {
    watchHandle = watchImmediate(
      () => session.value.data?.user.id,
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
