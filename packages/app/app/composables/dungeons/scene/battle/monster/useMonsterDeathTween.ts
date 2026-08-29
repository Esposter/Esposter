import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { useSettingsStore } from "@/store/dungeons/settings";
import { SECOND } from "@esposter/shared";
import { useTween } from "vue-phaserjs";

export const useMonsterDeathTween = (isEnemy: boolean) => {
  const store = useBattleMonsterStore(isEnemy);
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
    return undefined;
  }

  useTween(monsterInfoContainerTween, {
    delay: 0,
    duration: 2 * SECOND,
    onComplete: () => {
      monsterInfoContainerPosition.value.x = monsterInfoContainerPositionXEnd;
    },
    x: getTweenRange(monsterInfoContainerPosition.value.x, monsterInfoContainerPositionXEnd),
  });

  return new Promise<void>((resolve) => {
    useTween(monsterTween, {
      delay: 0,
      duration: 2 * SECOND,
      onComplete: () => {
        monsterPosition.value.y = monsterPositionYEnd;
        resolve();
      },
      y: getTweenRange(monsterPosition.value.y, monsterPositionYEnd),
    });
  });
};
