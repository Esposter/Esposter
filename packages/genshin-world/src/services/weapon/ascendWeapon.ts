import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { ascendToNextPhase } from "#src/services/character/ascendToNextPhase";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A weapon ascended at its phase's cap into the next phase, through the rule a character's ascension shares. A refusal
// Throws the reason it is refused now, before anything is taken, as the weapon's screen reports it
export const ascendWeapon = (
  weapon: Weapon,
  weaponData: WeaponData,
  { adventureRank, inventory, wallet }: { adventureRank: number; inventory: Inventory; wallet: Wallet },
): { inventory: Inventory; wallet: Wallet; weapon: Weapon } => {
  const ascended = ascendToNextPhase(weapon.ascension, weapon.level, weaponData.ascensionPhases, {
    adventureRank,
    inventory,
    wallet,
  });
  if (typeof ascended === "string") throw new InvalidOperationError(Operation.Update, ascendWeapon.name, ascended);
  return {
    inventory: ascended.inventory,
    wallet: ascended.wallet,
    weapon: { ...weapon, ascension: ascended.ascension },
  };
};
