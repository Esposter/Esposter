export const useTakeDamage = (isEnemy: boolean) => (damage: number) => {
  const store = useBattleMonsterStore(isEnemy);
  const { activeMonster } = storeToRefs(store);

  let newHp = activeMonster.value.status.health - damage;
  if (newHp < 0) newHp = 0;
  activeMonster.value.status.health = newHp;

  return useMonsterTakeDamageTween(isEnemy);
};
