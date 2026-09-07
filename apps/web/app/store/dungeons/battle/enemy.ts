import type { Monster } from "#shared/models/dungeons/monster/Monster";

export const useEnemyStore = defineStore("dungeons/battle/enemy", () => {
  const activeMonster = ref<Monster>();
  return {
    activeMonster: activeMonster as Ref<Monster>,
    ...useMonsterPositions({ x: -150, y: 144 }, { x: -600, y: 0 }),
  };
});
