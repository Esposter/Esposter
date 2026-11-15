import { getTweenRange } from "#src/services/dungeons/animation/getTweenRange";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { useTween } from "vue-phaserjs";

export const useMonsterInfoContainerAppearTween = (isEnemy: boolean) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { initialMonsterInfoContainerPosition } = battleMonsterStore;
  const { monsterInfoContainerPosition, monsterInfoContainerTween } = storeToRefs(battleMonsterStore);
  const xEnd = isEnemy ? 0 : 556;

  monsterInfoContainerPosition.value = structuredClone(initialMonsterInfoContainerPosition);

  const onAppear = () => {
    monsterInfoContainerPosition.value.x = xEnd;
    if (!isEnemy) phaserEventEmitter.emit("playerMonsterInfoContainerAppear");
  };
  return useSkippableAnimation(
    () =>
      new Promise<void>((resolve) => {
        useTween(monsterInfoContainerTween, {
          delay: 0,
          duration: 800,
          onComplete: () => {
            onAppear();
            resolve();
          },
          x: getTweenRange(monsterInfoContainerPosition.value.x, xEnd),
        });
      }),
    onAppear,
  );
};
