import { AttackId } from "@/models/dungeons/attack/AttackId";
import { type AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
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
    currentHp: 25,
    attackIds: [AttackId.IceShard],
  });
  const isActiveMonsterFainted = computed(() => activeMonster.value.currentHp <= 0);
  const activeMonsterAnimationState = ref<AnimationState | undefined>();
  const activeMonsterAnimationStateOnComplete = ref<(() => void) | undefined>();
  const isPlayingMonsterInfoContainerAppearAnimation = ref<true>();
  const takeDamage = useTakeDamage(true);

  return {
    activeMonster,
    isActiveMonsterFainted,
    activeMonsterAnimationState,
    activeMonsterAnimationStateOnComplete,
    isPlayingMonsterInfoContainerAppearAnimation,
    takeDamage,
  };
});
