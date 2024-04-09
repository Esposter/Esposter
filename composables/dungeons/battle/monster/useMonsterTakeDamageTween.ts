import { useTween } from "@/lib/phaser/composables/useTween";
import { dayjs } from "@/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useMonsterTakeDamageTween = (isEnemy: boolean, onComplete?: () => void) => {
  const store = isEnemy ? useEnemyStore() : usePlayerStore();
  const { monsterTween } = storeToRefs(store);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);

  if (isSkipAnimations.value) {
    onComplete?.();
    return;
  }

  useTween(monsterTween, {
    delay: 0,
    repeat: 10,
    duration: dayjs.duration(0.15, "seconds").asMilliseconds(),
    alpha: {
      from: 1,
      start: 1,
      to: 0,
    },
    onComplete: (_, [monsterImageGameObject]) => {
      monsterImageGameObject.setAlpha(1);
      onComplete?.();
    },
  });
};
