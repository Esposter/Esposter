import type { Character } from "#src/models/character/Character";
import type { CombatTalent } from "#src/models/character/CombatTalent";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { TalentUpgradeRefusal } from "#src/models/character/TalentUpgradeRefusal";
import { Currency } from "#src/models/inventory/Currency";
import { getTalentUpgrade } from "#src/services/character/getTalentUpgrade";
import { getTalentUpgradeRefusal } from "#src/services/character/getTalentUpgradeRefusal";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A combat talent raised one level, as the game raises it: the level above its own is looked up among its upgrades, and
// Refused, by the answer of getTalentUpgradeRefusal, where there is none or where the level is not yet met. A refusal
// Throws before anything is returned, so no part of the cost is ever taken
export const upgradeTalent = (
  character: Character,
  talent: CombatTalent,
  upgrades: readonly TalentUpgrade[],
  { inventory, wallet }: { inventory: Inventory; wallet: Wallet },
): { character: Character; inventory: Inventory; wallet: Wallet } => {
  const upgrade = getTalentUpgrade(character, talent, upgrades);
  if (!upgrade) throw new InvalidOperationError(Operation.Update, upgradeTalent.name, `${talent} at its last level`);
  const refusal = getTalentUpgradeRefusal(character, talent, upgrades, { inventory, wallet });
  if (refusal === TalentUpgradeRefusal.Phase)
    throw new InvalidOperationError(Operation.Update, upgradeTalent.name, `ascension ${upgrade.phase} for ${talent}`);
  else if (refusal === TalentUpgradeRefusal.Mora)
    throw new InvalidOperationError(Operation.Update, upgradeTalent.name, `${upgrade.coinCost} Mora`);
  else if (refusal === TalentUpgradeRefusal.Materials)
    throw new InvalidOperationError(Operation.Update, upgradeTalent.name, `materials for ${talent}`);
  const items = upgrade.costItems.reduce(
    (bagItems, { count, id }) => takeInventoryItems(bagItems, id, count),
    inventory.items,
  );
  return {
    character: { ...character, talentLevels: { ...character.talentLevels, [talent]: upgrade.level } },
    inventory: { ...inventory, items },
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - upgrade.coinCost },
  };
};
