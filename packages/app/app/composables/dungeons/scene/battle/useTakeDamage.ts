export const useTakeDamage = (isEnemy: boolean) => (damage: number) => {
  const battleMonsterStore = useBattleMonsterStore(isEnemy);
  const { activeMonster } = storeToRefs(battleMonsterStore);

  let newHealth = activeMonster.value.status.health - damage;
  if (newHealth < 0) newHealth = 0;
  activeMonster.value.status.health = newHealth;

  return useMonsterTakeDamageTween(isEnemy);
};
