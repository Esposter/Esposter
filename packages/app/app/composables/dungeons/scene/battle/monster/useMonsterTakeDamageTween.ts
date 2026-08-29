import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useTween } from "vue-phaserjs";

export const useMonsterTakeDamageTween = (isEnemy: boolean) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  if (isSkipAnimations.value) return undefined;

  const store = useBattleMonsterStore(isEnemy);
  const { monsterTween } = storeToRefs(store);
  return new Promise<void>((resolve) => {
    useTween(monsterTween, {
      alpha: getTweenRange(1, 0),
      delay: 0,
      duration: 150,
      onComplete: (_tween, [monsterImageGameObject]) => {
        monsterImageGameObject.setAlpha(1);
        resolve();
      },
      repeat: 10,
    });
  });
};
