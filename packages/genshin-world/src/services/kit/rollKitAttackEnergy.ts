import type { KitState } from "#src/models/kit/KitState";
import type { WeaponType } from "#src/models/weapon/WeaponType";

import { WeaponTypeAttackEnergyChanceMap } from "#src/services/combat/energy/WeaponTypeAttackEnergyChanceMap";

// Whether a normal or charged attack's hit on an enemy gives its character energy, drawn from the world's random source
// At its weapon's chance after the misses since the last hit that gave it, the count written into the kit's state: back
// To none on a hit that gives it, one more on one that does not
export const rollKitAttackEnergy = (kitState: KitState, weaponType: WeaponType, random: () => number): boolean => {
  const { base, increase } = WeaponTypeAttackEnergyChanceMap[weaponType];
  if (random() < base + increase * kitState.attackEnergyMissCount) {
    kitState.attackEnergyMissCount = 0;
    return true;
  }
  kitState.attackEnergyMissCount += 1;
  return false;
};
