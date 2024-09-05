import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";

export const useTakeDamage = (isEnemy: boolean) => {
  return (damage: number) => {
    const store = isEnemy ? useEnemyStore() : useBattlePlayerStore();
    const { activeMonster } = storeToRefs(store);

    let newHp = activeMonster.value.status.hp - damage;
    if (newHp < 0) newHp = 0;
    activeMonster.value.status.hp = newHp;

    return useMonsterTakeDamageTween(isEnemy);
  };
};
