import { dayjs } from "#shared/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useTween } from "vue-phaserjs";

export const useMonsterDeathTween = async (isEnemy: boolean) => {
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
    return;
  }

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

  return new Promise<void>((resolve) => {
    useTween(monsterTween, {
      delay: 0,
      duration: dayjs.duration(2, "seconds").asMilliseconds(),
      onComplete: () => {
        monsterPosition.value.y = monsterPositionYEnd;
        resolve();
      },
      y: {
        from: monsterPosition.value.y,
        start: monsterPosition.value.y,
        to: monsterPositionYEnd,
      },
    });
  });
};
