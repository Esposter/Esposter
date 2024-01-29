import { AttackId } from "@/models/dungeons/attack/AttackId";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { getAttackNames } from "@/services/dungeons/battle/getAttackNames";
import { PlayerOptionGrid } from "@/services/dungeons/battle/menu/PlayerOptionGrid";
import { getPlayerAttackOptionGrid } from "@/services/dungeons/battle/menu/getPlayerAttackOptionGrid";

export const usePlayerStore = defineStore("dungeons/battle/player", () => {
  const activeMonster = ref<Monster>({
    name: TextureManagerKey.Iguanignite,
    asset: {
      key: TextureManagerKey.Iguanignite,
    },
    stats: {
      maxHp: 25,
      baseAttack: 5,
    },
    currentLevel: 5,
    currentHp: 5,
    attackIds: [AttackId.Slash],
  });
  const isActiveMonsterFainted = computed(() => activeMonster.value.currentHp <= 0);
  const activeMonsterAnimationState = ref<AnimationState | undefined>();
  const activeMonsterAnimationStateOnComplete = ref<(() => void) | undefined>();
  const optionGrid = ref(PlayerOptionGrid);
  const attackNames = computed(() => getAttackNames(activeMonster.value));
  const attackOptionGrid = ref(getPlayerAttackOptionGrid(attackNames.value));
  const isPlayingHealthBarAppearAnimation = ref<true>();

  const takeDamage = (damage: number, onComplete?: () => void) => {
    let newHp = activeMonster.value.currentHp - damage;
    if (newHp < 0) newHp = 0;
    activeMonster.value.currentHp = newHp;
    activeMonsterAnimationStateOnComplete.value = () => {
      onComplete?.();
      // Unlike other animations, we need to repeat this
      // so we want to refresh the computed tween that depends on this
      activeMonsterAnimationState.value = undefined;
    };
    activeMonsterAnimationState.value = AnimationState.TakeDamage;
  };

  return {
    activeMonster,
    isActiveMonsterFainted,
    activeMonsterAnimationState,
    activeMonsterAnimationStateOnComplete,
    optionGrid,
    attackNames,
    attackOptionGrid,
    isPlayingHealthBarAppearAnimation,
    takeDamage,
  };
});
