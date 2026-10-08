import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Currency } from "#src/models/inventory/Currency";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A weapon ascended at its phase's cap into the next phase, as the game takes it: the next phase's Mora and items are
// Taken from the wallet and the bag, once the player's Adventure Rank reaches the phase's requirement. Its level stays
// At the cap, which the next phase starts from
export const ascendWeapon = (
  weapon: Weapon,
  weaponData: WeaponData,
  { adventureRank, inventory, wallet }: { adventureRank: number; inventory: Inventory; wallet: Wallet },
): { inventory: Inventory; wallet: Wallet; weapon: Weapon } => {
  const phase = weaponData.ascensionPhases[weapon.ascension];
  const nextPhase = weaponData.ascensionPhases[weapon.ascension + 1];
  if (!phase || !nextPhase || weapon.level !== phase.maxLevel)
    throw new InvalidOperationError(
      Operation.Update,
      ascendWeapon.name,
      `level ${weapon.level} is not at a phase's cap`,
    );
  if (adventureRank < nextPhase.requiredPlayerLevel)
    throw new InvalidOperationError(Operation.Update, ascendWeapon.name, `Adventure Rank ${adventureRank}`);
  if (wallet[Currency.Mora] < nextPhase.coinCost)
    throw new InvalidOperationError(Operation.Update, ascendWeapon.name, `${nextPhase.coinCost} Mora`);
  const items = nextPhase.costItems.reduce(
    (bagItems, { count, id }) => takeInventoryItems(bagItems, id, count),
    inventory.items,
  );
  return {
    inventory: { items, nextId: inventory.nextId },
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - nextPhase.coinCost },
    weapon: { ...weapon, ascension: weapon.ascension + 1 },
  };
};
