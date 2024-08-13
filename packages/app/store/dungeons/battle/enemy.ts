import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { Position } from "grid-engine";

export const useEnemyStore = defineStore("dungeons/battle/enemy", () => {
  const activeMonster = ref() as Ref<Monster>;
  const initialMonsterPosition = Object.freeze<Position>({ x: -150, y: 144 });
  const monsterPosition = ref({ ...initialMonsterPosition });
  const monsterTween = ref<TweenBuilderConfiguration>();
  const initialMonsterInfoContainerPosition: Position = Object.freeze<Position>({ x: -600, y: 0 });
  const monsterInfoContainerPosition = ref({ ...initialMonsterInfoContainerPosition });
  const monsterInfoContainerTween = ref<TweenBuilderConfiguration>();
  const takeDamage = useTakeDamage(true);
  return {
    activeMonster,
    initialMonsterInfoContainerPosition,
    initialMonsterPosition,
    monsterInfoContainerPosition,
    monsterInfoContainerTween,
    monsterPosition,
    monsterTween,
    takeDamage,
  };
});
