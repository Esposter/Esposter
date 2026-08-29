import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useTween } from "vue-phaserjs";

export const useMonsterInfoContainerAppearTween = (isEnemy: boolean) => {
  const store = useBattleMonsterStore(isEnemy);
  const { initialMonsterInfoContainerPosition } = store;
  const { monsterInfoContainerPosition, monsterInfoContainerTween } = storeToRefs(store);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const xEnd = isEnemy ? 0 : 556;

  monsterInfoContainerPosition.value = { ...initialMonsterInfoContainerPosition };

  if (isSkipAnimations.value) {
    monsterInfoContainerPosition.value.x = xEnd;
    if (!isEnemy) phaserEventEmitter.emit("playerMonsterInfoContainerAppear");
    return;
  }

  useTween(monsterInfoContainerTween, {
    delay: 0,
    duration: 800,
    onComplete: () => {
      monsterInfoContainerPosition.value.x = xEnd;
      if (!isEnemy) phaserEventEmitter.emit("playerMonsterInfoContainerAppear");
    },
    x: getTweenRange(monsterInfoContainerPosition.value.x, xEnd),
  });
};
