import { AttackId } from "@/models/dungeons/attack/AttackId";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";

export const useEnemyStore = defineStore("dungeons/battle/enemy", () => {
  const activeMonster = ref<Monster>({
    name: TextureManagerKey.Carnodusk,
    asset: {
      key: TextureManagerKey.Carnodusk,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 5,
    attackIds: [AttackId.IceShard],
  });
  const isActiveMonsterFainted = computed(() => activeMonster.value.currentHp <= 0);
  const activeMonsterAnimationState = ref<AnimationState | undefined>();
  const activeMonsterAnimationStateOnComplete = ref<(() => void) | undefined>();
  const isPlayingHealthBarAppearAnimation = ref<true>();

  const takeDamage = (damage: number, onComplete?: () => void) => {
    let newHp = activeMonster.value.currentHp - damage;
    if (newHp < 0) newHp = 0;
    activeMonster.value.currentHp = newHp;
    activeMonsterAnimationStateOnComplete.value = () => {
      // Unlike other animations, we need to repeat this
      // so we want to refresh the computed tween that depends on this
      activeMonsterAnimationState.value = undefined;
      onComplete?.();
    };
    activeMonsterAnimationState.value = AnimationState.TakeDamage;
  };

  return {
    activeMonster,
    isActiveMonsterFainted,
    activeMonsterAnimationState,
    activeMonsterAnimationStateOnComplete,
    isPlayingHealthBarAppearAnimation,
    takeDamage,
  };
});
