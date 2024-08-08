import type { OnComplete } from "@/models/shared/OnComplete";

import { useTween } from "@/lib/phaser/composables/useTween";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useMonsterTakeDamageTween = async (isEnemy: boolean, onComplete?: OnComplete) => {
  const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
  const { monsterTween } = storeToRefs(store);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);

  if (isSkipAnimations.value) {
    await onComplete?.();
    return;
  }

  useTween(monsterTween, {
    alpha: {
      from: 1,
      start: 1,
      to: 0,
    },
    delay: 0,
    duration: dayjs.duration(0.15, "seconds").asMilliseconds(),
    onComplete: async (_, [monsterImageGameObject]) => {
      monsterImageGameObject.setAlpha(1);
      await onComplete?.();
    },
    repeat: 10,
  });
};
