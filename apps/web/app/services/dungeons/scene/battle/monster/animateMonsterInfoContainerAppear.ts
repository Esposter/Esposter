import { useBattleMonsterStore } from "#src/composables/dungeons/scene/battle/monster/useBattleMonsterStore";
import { animateOrSkip } from "#src/services/dungeons/animation/animateOrSkip";
import { getTweenRange } from "#src/services/dungeons/animation/getTweenRange";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { useTweenAsync } from "vue-phaserjs";

export const animateMonsterInfoContainerAppear = (isEnemy: boolean) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { initialMonsterInfoContainerPosition } = battleMonsterStore;
  const { monsterInfoContainerPosition, monsterInfoContainerTween } = storeToRefs(battleMonsterStore);
  const xEnd = isEnemy ? 0 : 556;

  monsterInfoContainerPosition.value = structuredClone(initialMonsterInfoContainerPosition);

  const onAppear = () => {
    monsterInfoContainerPosition.value.x = xEnd;
    if (!isEnemy) phaserEventEmitter.emit("playerMonsterInfoContainerAppear");
  };
  return animateOrSkip(
    () =>
      useTweenAsync(monsterInfoContainerTween, {
        delay: 0,
        duration: 800,
        onComplete: onAppear,
        x: getTweenRange(monsterInfoContainerPosition.value.x, xEnd),
      }),
    onAppear,
  );
};
