import { useBattleMonsterStore } from "#src/composables/dungeons/scene/battle/monster/useBattleMonsterStore";
import { animateOrSkip } from "#src/services/dungeons/animation/animateOrSkip";
import { getTweenRange } from "#src/services/dungeons/animation/getTweenRange";
import { useTweenAsync } from "vue-phaserjs";

export const animateMonsterTakeDamage = (isEnemy: boolean) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { monsterTween } = storeToRefs(battleMonsterStore);
  return animateOrSkip(() =>
    useTweenAsync(monsterTween, {
      alpha: getTweenRange(1, 0),
      delay: 0,
      duration: 150,
      onComplete: (_tween, [monsterImageGameObject]) => {
        monsterImageGameObject.setAlpha(1);
      },
      repeat: 10,
    }),
  );
};
