import type { OnComplete } from "@/models/shared/OnComplete";

import { useTween } from "@/lib/phaser/composables/useTween";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useMonsterAppearTween = async (isEnemy: boolean, onComplete?: OnComplete) => {
  const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
  const { initialMonsterPosition } = store;
  const { monsterPosition, monsterTween } = storeToRefs(store);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const xEnd = isEnemy ? 768 : 256;
  // Ensure that we are tweening from the correct initial position
  monsterPosition.value = { ...initialMonsterPosition };

  if (isSkipAnimations.value) {
    monsterPosition.value.x = xEnd;
    await onComplete?.();
    return;
  }

  useTween(monsterTween, {
    delay: 0,
    duration: dayjs.duration(isEnemy ? 1.6 : 0.8, "seconds").asMilliseconds(),
    onComplete: async () => {
      monsterPosition.value.x = xEnd;
      await onComplete?.();
    },
    x: {
      from: monsterPosition.value.x,
      start: monsterPosition.value.x,
      to: xEnd,
    },
  });
};
