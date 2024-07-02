import { useTween } from "@/lib/phaser/composables/useTween";
import type { OnComplete } from "@/models/shared/OnComplete";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useMonsterDeathTween = async (isEnemy: boolean, onComplete?: OnComplete) => {
  const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
  const { monsterPosition, monsterTween, monsterInfoContainerPosition, monsterInfoContainerTween } = storeToRefs(store);
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
    y: {
      from: monsterPosition.value.y,
      start: monsterPosition.value.y,
      to: monsterPositionYEnd,
    },
    onUpdate: (_tween, _key, _target, y) => {
      monsterPosition.value.y = y;
    },
    onComplete: async () => {
      await onComplete?.();
    },
  });
  useTween(monsterInfoContainerTween, {
    delay: 0,
    duration: dayjs.duration(2, "seconds").asMilliseconds(),
    x: {
      from: monsterInfoContainerPosition.value.x,
      start: monsterInfoContainerPosition.value.x,
      to: monsterInfoContainerPositionXEnd,
    },
    onUpdate: (_tween, _key, _target, x) => {
      monsterInfoContainerPosition.value.x = x;
    },
  });
};
