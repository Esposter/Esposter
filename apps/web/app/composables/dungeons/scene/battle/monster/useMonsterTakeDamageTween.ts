import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { useTween } from "vue-phaserjs";

export const useMonsterTakeDamageTween = (isEnemy: boolean) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { monsterTween } = storeToRefs(battleMonsterStore);
  return useSkippableAnimation(
    () =>
      new Promise<void>((resolve) => {
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
      }),
  );
};
