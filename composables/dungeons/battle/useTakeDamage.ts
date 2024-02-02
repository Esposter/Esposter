import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { usePlayerStore } from "@/store/dungeons/battle/player";

export const useTakeDamage = (isEnemy?: true) => {
  return (damage: number, onComplete?: () => void) => {
    const store = isEnemy ? useEnemyStore() : usePlayerStore();
    const { activeMonster, activeMonsterAnimationState, activeMonsterAnimationStateOnComplete } = storeToRefs(store);

    let newHp = activeMonster.value.currentHp - damage;
    if (newHp < 0) newHp = 0;
    activeMonster.value.currentHp = newHp;
    activeMonsterAnimationStateOnComplete.value = onComplete;
    activeMonsterAnimationState.value = AnimationState.TakeDamage;
  };
};
