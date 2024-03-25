import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { AttackId } from "@/models/dungeons/attack/AttackId";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { MonsterId } from "@/models/dungeons/monster/MonsterId";
import type { Position } from "grid-engine";

export const useEnemyStore = defineStore("dungeons/battle/enemy", () => {
  const activeMonster = ref<Monster>({
    id: MonsterId.Carnodusk,
    name: MonsterId.Carnodusk,
    asset: {
      key: ImageKey.Carnodusk,
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
