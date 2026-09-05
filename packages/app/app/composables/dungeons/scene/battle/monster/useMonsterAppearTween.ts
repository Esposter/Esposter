import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useTween } from "vue-phaserjs";

export const useMonsterAppearTween = (isEnemy: boolean) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { initialMonsterPosition } = battleMonsterStore;
  const { monsterPosition, monsterTween } = storeToRefs(battleMonsterStore);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const xEnd = isEnemy ? 768 : 256;
  // The tween runs from wherever the position currently is, so it is reset to the initial one first
  monsterPosition.value = { ...initialMonsterPosition };

  if (isSkipAnimations.value) {
    monsterPosition.value.x = xEnd;
    return undefined;
  }

  return new Promise<void>((resolve) => {
    useTween(monsterTween, {
      delay: 0,
      duration: isEnemy ? 1600 : 800,
      onComplete: () => {
        monsterPosition.value.x = xEnd;
        resolve();
      },
      x: getTweenRange(monsterPosition.value.x, xEnd),
    });
  });
};
