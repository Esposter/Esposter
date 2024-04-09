import { useTween } from "@/lib/phaser/composables/useTween";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useMonsterAppearTween = (isEnemy: boolean, onComplete?: () => void) => {
  const store = isEnemy ? useEnemyStore() : usePlayerStore();
  const { monsterPosition, monsterTween } = storeToRefs(store);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const xEnd = isEnemy ? 768 : 256;

  if (isSkipAnimations.value) {
    monsterPosition.value.x = xEnd;
    onComplete?.();
    return;
  }

  useTween(monsterTween, {
    delay: 0,
    duration: dayjs.duration(isEnemy ? 1.6 : 0.8, "seconds").asMilliseconds(),
    x: {
      from: monsterPosition.value.x,
      start: monsterPosition.value.x,
      to: xEnd,
    },
    onComplete: () => {
      onComplete?.();
    },
  });
};
