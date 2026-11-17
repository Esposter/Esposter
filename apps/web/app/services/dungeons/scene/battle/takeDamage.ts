import { useBattleMonsterStore } from "#src/composables/dungeons/scene/battle/monster/useBattleMonsterStore";
import { animateMonsterTakeDamage } from "#src/services/dungeons/scene/battle/monster/animateMonsterTakeDamage";

export const takeDamage = (isEnemy: boolean, damage: number) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { activeMonster } = storeToRefs(battleMonsterStore);

  activeMonster.value.status.health = Math.max(0, activeMonster.value.status.health - damage);

  return animateMonsterTakeDamage(isEnemy);
};
