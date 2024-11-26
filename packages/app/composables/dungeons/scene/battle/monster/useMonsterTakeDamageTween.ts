import { dayjs } from "@/shared/services/dayjs";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useTween } from "vue-phaserjs";

export const useMonsterTakeDamageTween = (isEnemy: boolean) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  if (isSkipAnimations.value) return;

  const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
  const { monsterTween } = storeToRefs(store);
  return new Promise<void>((resolve) => {
    useTween(monsterTween, {
      alpha: {
        from: 1,
        start: 1,
        to: 0,
      },
      delay: 0,
      duration: dayjs.duration(0.15, "seconds").asMilliseconds(),
      onComplete: (_, [monsterImageGameObject]) => {
        monsterImageGameObject.setAlpha(1);
        resolve();
      },
      repeat: 10,
    });
  });
};
