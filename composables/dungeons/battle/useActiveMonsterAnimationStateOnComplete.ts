import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const useActiveMonsterAnimationStateOnComplete = (isEnemy?: true) => {
  return () => {
    const store = isEnemy ? useEnemyStore() : usePlayerStore();
    const { activeMonsterAnimationState, activeMonsterAnimationStateOnComplete } = storeToRefs(store);
    const onComplete = activeMonsterAnimationStateOnComplete.value;
    activeMonsterAnimationState.value = undefined;
    activeMonsterAnimationStateOnComplete.value = undefined;
    onComplete?.();
  };
};
