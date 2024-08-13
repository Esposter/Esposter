import type { OnComplete } from "@/models/shared/OnComplete";

import { useTween } from "@/lib/phaser/composables/useTween";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useMonsterDeathTween = async (isEnemy: boolean, onComplete?: OnComplete) => {
  const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
  const { monsterInfoContainerPosition, monsterInfoContainerTween, monsterPosition, monsterTween } = storeToRefs(store);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const monsterPositionYEnd = isEnemy ? monsterPosition.value.y - 400 : monsterPosition.value.y + 400;
  const monsterInfoContainerPositionXEnd = isEnemy
    ? monsterInfoContainerPosition.value.x - 600
    : monsterInfoContainerPosition.value.x + 600;

  if (isSkipAnimations.value) {
    monsterPosition.value.y = monsterPositionYEnd;
    monsterInfoContainerPosition.value.x = monsterInfoContainerPositionXEnd;
    await onComplete?.();
    return;
  }

  useTween(monsterTween, {
    delay: 0,
    duration: dayjs.duration(2, "seconds").asMilliseconds(),
    // as it may also be re-used for animating switching monsters
    onComplete: async () => {
      monsterPosition.value.y = monsterPositionYEnd;
      await onComplete?.();
    },
    // For monster death tween, we reset to initial positions for everything
    y: {
      from: monsterPosition.value.y,
      start: monsterPosition.value.y,
      to: monsterPositionYEnd,
    },
  });
  useTween(monsterInfoContainerTween, {
    delay: 0,
    duration: dayjs.duration(2, "seconds").asMilliseconds(),
    onComplete: () => {
      monsterInfoContainerPosition.value.x = monsterInfoContainerPositionXEnd;
    },
    x: {
      from: monsterInfoContainerPosition.value.x,
      start: monsterInfoContainerPosition.value.x,
      to: monsterInfoContainerPositionXEnd,
    },
  });
};
