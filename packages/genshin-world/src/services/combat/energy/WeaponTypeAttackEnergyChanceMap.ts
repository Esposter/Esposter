import type { AttackEnergyChance } from "#src/models/combat/AttackEnergyChance";

import { WeaponType } from "#src/models/weapon/WeaponType";

// Each weapon's chance of energy from a normal or charged attack's hit, as the wiki's Energy page gives them: a sword's
// Starts at 10% and every other at none, rising by 5% a miss for a sword and a bow, 10% for a claymore and a catalyst,
// And 4% for a polearm
export const WeaponTypeAttackEnergyChanceMap: Record<WeaponType, AttackEnergyChance> = {
  [WeaponType.Bow]: { base: 0, increase: 0.05 },
  [WeaponType.Catalyst]: { base: 0, increase: 0.1 },
  [WeaponType.Claymore]: { base: 0, increase: 0.1 },
  [WeaponType.Polearm]: { base: 0, increase: 0.04 },
  [WeaponType.Sword]: { base: 0.1, increase: 0.05 },
};
