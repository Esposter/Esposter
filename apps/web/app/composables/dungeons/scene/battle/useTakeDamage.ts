export const useTakeDamage = (isEnemy: boolean) => (damage: number) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { activeMonster } = storeToRefs(battleMonsterStore);

  activeMonster.value.status.health = Math.max(0, activeMonster.value.status.health - damage);

  return useMonsterTakeDamageTween(isEnemy);
};
