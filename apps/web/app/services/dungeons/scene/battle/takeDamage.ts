import { useBattleMonsterStore } from "#src/composables/dungeons/scene/battle/monster/useBattleMonsterStore";
import { animateMonsterTakeDamage } from "#src/services/dungeons/scene/battle/monster/animateMonsterTakeDamage";
import { NotFoundError } from "@esposter/shared";

export const takeDamage = (isEnemy: boolean, damage: number) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { activeMonster } = storeToRefs(battleMonsterStore);
  if (!activeMonster.value) throw new NotFoundError(takeDamage.name, "active monster");

  activeMonster.value.status.health = Math.max(0, activeMonster.value.status.health - damage);

  return animateMonsterTakeDamage(isEnemy);
};
