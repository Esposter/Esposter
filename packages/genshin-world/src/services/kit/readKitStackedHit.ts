import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitHit } from "#src/models/kit/KitHit";

// The talent multiplier and poise a hit deals an enemy by the stacks of its stacked status, which the hit consumes. A
// Hit with no stacked hit deals its own
export const readKitStackedHit = (enemy: Enemy, kitHit: KitHit): { poiseDamage: number; talentMultiplier: number } => {
  const { stackedHit } = kitHit;
  if (!stackedHit) return { poiseDamage: kitHit.poiseDamage, talentMultiplier: kitHit.talentMultiplier };
  const stacks = enemy.statuses.find(({ id }) => id === stackedHit.statusId)?.stacks ?? 0;
  enemy.statuses = enemy.statuses.filter(({ id }) => id !== stackedHit.statusId);
  return {
    poiseDamage: stackedHit.poiseDamages[stacks] ?? kitHit.poiseDamage,
    talentMultiplier: stackedHit.talentMultipliers[stacks] ?? kitHit.talentMultiplier,
  };
};
