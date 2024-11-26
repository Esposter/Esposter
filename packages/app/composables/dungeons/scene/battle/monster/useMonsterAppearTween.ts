import { dayjs } from "@/shared/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useTween } from "vue-phaserjs";

export const useMonsterAppearTween = async (isEnemy: boolean) => {
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
    return;
  }

  return new Promise<void>((resolve) => {
    useTween(monsterTween, {
      delay: 0,
      duration: dayjs.duration(isEnemy ? 1.6 : 0.8, "seconds").asMilliseconds(),
      onComplete: () => {
        monsterPosition.value.x = xEnd;
        resolve();
      },
      x: {
        from: monsterPosition.value.x,
        start: monsterPosition.value.x,
        to: xEnd,
      },
    });
  });
};
