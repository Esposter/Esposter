import type { Character } from "#src/models/character/Character";
import type { CombatTalent } from "#src/models/character/CombatTalent";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { TalentUpgradeRefusal } from "#src/models/character/TalentUpgradeRefusal";
import { Currency } from "#src/models/inventory/Currency";
import { getTalentUpgrade } from "#src/services/character/getTalentUpgrade";
import { checkIsItemCountsHeld } from "#src/services/inventory/checkIsItemCountsHeld";

// Why a combat talent cannot rise one level now, as the game refuses it, or undefined when every requirement is met: the
// Level above its own is looked up among its upgrades, and the character's phase, the wallet's Mora and the bag's items
// Are checked in that order
export const getTalentUpgradeRefusal = (
  character: Character,
  talent: CombatTalent,
  upgrades: readonly TalentUpgrade[],
  { inventory, wallet }: { inventory: Inventory; wallet: Wallet },
): TalentUpgradeRefusal | undefined => {
  const upgrade = getTalentUpgrade(character, talent, upgrades);
  if (!upgrade) return TalentUpgradeRefusal.LastLevel;
  else if (character.ascension < upgrade.phase) return TalentUpgradeRefusal.Phase;
  else if (wallet[Currency.Mora] < upgrade.coinCost) return TalentUpgradeRefusal.Mora;
  else if (!checkIsItemCountsHeld(inventory.items, upgrade.costItems)) return TalentUpgradeRefusal.Materials;
  return undefined;
};
