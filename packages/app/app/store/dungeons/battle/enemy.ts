import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { Position } from "grid-engine";
import type { TweenBuilderConfiguration } from "vue-phaserjs";

export const useEnemyStore = defineStore("dungeons/battle/enemy", () => {
  const activeMonster = ref<Monster>();
  const initialMonsterPosition = Object.freeze<Position>({ x: -150, y: 144 });
  const monsterPosition = ref({ ...initialMonsterPosition });
  const monsterTween = ref<TweenBuilderConfiguration>();
  const initialMonsterInfoContainerPosition: Position = Object.freeze<Position>({ x: -600, y: 0 });
  const monsterInfoContainerPosition = ref({ ...initialMonsterInfoContainerPosition });
  const monsterInfoContainerTween = ref<TweenBuilderConfiguration>();
  const takeDamage = useTakeDamage(true);
  return {
    activeMonster: activeMonster as Ref<Monster>,
    initialMonsterInfoContainerPosition,
    initialMonsterPosition,
    monsterInfoContainerPosition,
    monsterInfoContainerTween,
    monsterPosition,
    monsterTween,
    takeDamage,
  };
});
