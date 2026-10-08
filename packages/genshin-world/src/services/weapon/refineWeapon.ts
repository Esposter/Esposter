import type { Wallet } from "#src/models/inventory/Wallet";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Currency } from "#src/models/inventory/Currency";
import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A weapon refined by the ranks it gains from a copy or a refinement material, each rank gained costing the Mora its
// Rank asks, as the game charges it. Ranks past the fifth are lost, which the result counts. A weapon with no refinement
// Costs of its own, a weapon of one or two stars, cannot be refined at all
export const refineWeapon = (
  weapon: Weapon,
  weaponData: WeaponData,
  wallet: Wallet,
  gainedRanks: number,
): { lostRanks: number; wallet: Wallet; weapon: Weapon } => {
  if (weaponData.refinementCosts.length === 0 || weapon.refinement >= MAX_WEAPON_REFINEMENT)
    throw new InvalidOperationError(Operation.Update, refineWeapon.name, `refinement ${weapon.refinement}`);
  const refinement = Math.min(weapon.refinement + gainedRanks, MAX_WEAPON_REFINEMENT);
  const moraCost = weaponData.refinementCosts
    .slice(weapon.refinement - 1, refinement - 1)
    .reduce((sum, rankCost) => sum + rankCost, 0);
  if (wallet[Currency.Mora] < moraCost)
    throw new InvalidOperationError(Operation.Update, refineWeapon.name, `${moraCost} Mora`);
  return {
    lostRanks: weapon.refinement + gainedRanks - refinement,
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - moraCost },
    weapon: { ...weapon, refinement },
  };
};
