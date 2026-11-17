import { useBattleMonsterStore } from "#src/composables/dungeons/scene/battle/monster/useBattleMonsterStore";
import { animateOrSkip } from "#src/services/dungeons/animation/animateOrSkip";
import { getTweenRange } from "#src/services/dungeons/animation/getTweenRange";
import { useTween } from "vue-phaserjs";

export const animateMonsterTakeDamage = (isEnemy: boolean) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { monsterTween } = storeToRefs(battleMonsterStore);
  return animateOrSkip(
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
