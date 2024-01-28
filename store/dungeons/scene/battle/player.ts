import { AttackId } from "@/models/dungeons/attack/AttackId";
import { AnimationState } from "@/models/dungeons/battle/monsters/AnimationState";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { PlayerOptionGrid } from "@/services/dungeons/battle/UI/menu/PlayerOptionGrid";
import { getPlayerAttackOptionGrid } from "@/services/dungeons/battle/UI/menu/getPlayerAttackOptionGrid";
import { getAttackNames } from "@/services/dungeons/battle/getAttackNames";

export const usePlayerStore = defineStore("dungeons/scene/battle/player", () => {
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
    currentHp: 25,
    attackIds: [AttackId.Slash],
  });
  const isActiveMonsterFainted = computed(() => activeMonster.value.currentHp <= 0);
  const activeMonsterAnimationState = ref<AnimationState | undefined>();
  const activeMonsterAnimationStateOnComplete = ref<(() => void) | undefined>();
  const optionGrid = ref(PlayerOptionGrid);
  const attackNames = computed(() => getAttackNames(activeMonster.value));
  const attackOptionGrid = ref(getPlayerAttackOptionGrid(attackNames.value));
  const isPlayingHealthBarAppearAnimation = ref<true>();
  const inputPromptCursorPositionX = ref();
  const inputPromptCursorDisplayWidth = ref<number>();

  const takeDamage = (damage: number, onComplete?: () => void) => {
    let newHp = activeMonster.value.currentHp - damage;
    if (newHp < 0) newHp = 0;
    activeMonster.value.currentHp = newHp;
    activeMonsterAnimationStateOnComplete.value = onComplete;
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
    inputPromptCursorPositionX,
    inputPromptCursorDisplayWidth,
    takeDamage,
  };
});
