import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { type Monster } from "@/models/dungeons/battle/monster/Monster";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";

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
  const monsterPosition = ref<Position>({ x: -100, y: 144 });
  const monsterTween = ref<TweenBuilderConfiguration>();
  const monsterInfoContainerPosition = ref<Position>({ x: -600, y: 0 });
  const monsterInfoContainerTween = ref<TweenBuilderConfiguration>();
  const takeDamage = useTakeDamage(true);

  return {
    activeMonster,
    isActiveMonsterFainted,
    monsterPosition,
    monsterTween,
    monsterInfoContainerPosition,
    monsterInfoContainerTween,
    takeDamage,
  };
});
