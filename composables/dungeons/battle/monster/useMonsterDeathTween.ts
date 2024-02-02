import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useMonsterDeathTween = (isEnemy: boolean, onComplete?: () => void) => {
  const store = isEnemy ? useEnemyStore() : usePlayerStore();
  const { monsterPosition, monsterTween } = storeToRefs(store);
  const settingsStore = useSettingsStore();
  const { isSkipBattleAnimations } = storeToRefs(settingsStore);
  const yEnd = isEnemy ? monsterPosition.value.y - 400 : monsterPosition.value.y + 400;

  if (isSkipBattleAnimations.value) {
    monsterPosition.value.y = yEnd;
    onComplete?.();
    return;
  }

  monsterTween.value = {
    delay: 0,
    duration: dayjs.duration(2, "seconds").asMilliseconds(),
    y: {
      from: monsterPosition.value.y,
      start: monsterPosition.value.y,
      to: yEnd,
    },
    onComplete: () => {
      monsterTween.value = undefined;
      onComplete?.();
    },
  };
};
