import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { type Monster } from "@/models/dungeons/battle/monster/Monster";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { getAttackNames } from "@/services/dungeons/battle/getAttackNames";
import { PlayerOptionGrid } from "@/services/dungeons/battle/menu/PlayerOptionGrid";
import { getPlayerAttackOptionGrid } from "@/services/dungeons/battle/menu/getPlayerAttackOptionGrid";
import { type Position } from "grid-engine";

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
    currentHp: 25,
    attackIds: [AttackId.Slash],
  });
  const isActiveMonsterFainted = computed(() => activeMonster.value.currentHp <= 0);
  const monsterPosition = ref<Position>({ x: -100, y: 316 });
  const monsterTween = ref<TweenBuilderConfiguration>();
  const optionGrid = ref(PlayerOptionGrid);
  const attackNames = computed(() => getAttackNames(activeMonster.value));
  const attackOptionGrid = ref(getPlayerAttackOptionGrid(attackNames.value));
  const isPlayingMonsterInfoContainerAppearAnimation = ref<true>();
  const takeDamage = useTakeDamage(false);

  return {
    activeMonster,
    isActiveMonsterFainted,
    monsterPosition,
    monsterTween,
    optionGrid,
    attackNames,
    attackOptionGrid,
    isPlayingMonsterInfoContainerAppearAnimation,
    takeDamage,
  };
});
