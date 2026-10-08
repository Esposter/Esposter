import type { Character } from "#src/models/character/Character";
import type { CombatTalent } from "#src/models/character/CombatTalent";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A combat talent raised one level, as the game raises it: the level above its own is looked up among its upgrades, and
// Refused where there is none, where the character's ascension phase has not reached the level's, or where the wallet or
// The bag lacks what the level costs. A refusal throws before anything is returned, so no part of the cost is ever taken
export const upgradeTalent = (
  character: Character,
  talent: CombatTalent,
  upgrades: readonly TalentUpgrade[],
  { inventory, wallet }: { inventory: Inventory; wallet: Wallet },
): { character: Character; inventory: Inventory; wallet: Wallet } => {
  const level = character.talentLevels[talent] + 1;
  const upgrade = upgrades.find((candidate) => candidate.level === level);
  if (!upgrade) throw new InvalidOperationError(Operation.Update, upgradeTalent.name, `${talent} at its last level`);
  if (character.ascension < upgrade.phase)
    throw new InvalidOperationError(Operation.Update, upgradeTalent.name, `ascension ${upgrade.phase} for ${talent}`);
  if (wallet[Currency.Mora] < upgrade.coinCost)
    throw new InvalidOperationError(Operation.Update, upgradeTalent.name, `${upgrade.coinCost} Mora`);
  const items = upgrade.costItems.reduce(
    (bagItems, { count, id }) => takeInventoryItems(bagItems, id, count),
    inventory.items,
  );
  return {
    character: { ...character, talentLevels: { ...character.talentLevels, [talent]: level } },
    inventory: { items, nextId: inventory.nextId },
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - upgrade.coinCost },
  };
};
