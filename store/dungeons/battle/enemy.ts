import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { MonsterName } from "@/models/dungeons/monster/MonsterName";
import { getMonster } from "@/services/dungeons/monster/getMonster";
import type { Position } from "grid-engine";

export const useEnemyStore = defineStore("dungeons/battle/enemy", () => {
  const activeMonster = ref<Monster>({ id: crypto.randomUUID(), ...getMonster(MonsterName.Carnodusk) });
  const isActiveMonsterFainted = computed(() => activeMonster.value.currentHp <= 0);
  const initialMonsterPosition: Position = { x: -100, y: 144 };
  const monsterPosition = ref({ ...initialMonsterPosition });
  const monsterTween = ref<TweenBuilderConfiguration>();
  const initialMonsterInfoContainerPosition: Position = { x: -600, y: 0 };
  const monsterInfoContainerPosition = ref({ ...initialMonsterInfoContainerPosition });
  const monsterInfoContainerTween = ref<TweenBuilderConfiguration>();
  const takeDamage = useTakeDamage(true);

  return {
    activeMonster,
    isActiveMonsterFainted,
    initialMonsterPosition,
    monsterPosition,
    monsterTween,
    initialMonsterInfoContainerPosition,
    monsterInfoContainerPosition,
    monsterInfoContainerTween,
    takeDamage,
  };
});
