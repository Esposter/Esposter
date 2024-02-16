import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useMonsterInfoContainerAppearTween = (isEnemy: boolean) => {
  const store = isEnemy ? useEnemyStore() : usePlayerStore();
  const { monsterInfoContainerPosition, monsterInfoContainerTween } = storeToRefs(store);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const xEnd = isEnemy ? 0 : 556;

  if (isSkipAnimations.value) {
    monsterInfoContainerPosition.value.x = xEnd;
    return;
  }

  monsterInfoContainerTween.value = {
    delay: 0,
    duration: dayjs.duration(0.8, "seconds").asMilliseconds(),
    x: {
      from: monsterInfoContainerPosition.value.x,
      start: monsterInfoContainerPosition.value.x,
      to: xEnd,
    },
    onComplete: () => {
      monsterInfoContainerTween.value = undefined;
    },
  };
};
