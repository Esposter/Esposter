import { dayjs } from "#shared/services/dayjs";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useTween } from "vue-phaserjs";

export const useMonsterInfoContainerAppearTween = (isEnemy: boolean) => {
  const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
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
    duration: dayjs.duration(0.8, "seconds").asMilliseconds(),
    onComplete: () => {
      monsterInfoContainerPosition.value.x = xEnd;
      if (!isEnemy) phaserEventEmitter.emit("playerMonsterInfoContainerAppear");
    },
    x: {
      from: monsterInfoContainerPosition.value.x,
      start: monsterInfoContainerPosition.value.x,
      to: xEnd,
    },
  });
};
