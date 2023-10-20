export const calculateDamage = (attack: number, armor: number): number => {
  const realAttack = attack - armor;
  if (realAttack <= 0) return 0;

  let damage = 0;
  for (let i = 0; i < realAttack; i++) if (Math.random() < 0.5) damage++;
  return damage;
};
