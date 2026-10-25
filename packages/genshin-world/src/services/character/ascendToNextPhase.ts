import type { AscensionCost } from "#src/models/character/AscensionCost";
import type { AscensionPhase } from "#src/models/character/AscensionPhase";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { AscensionRefusal } from "#src/models/character/AscensionRefusal";
import { Currency } from "#src/models/inventory/Currency";
import { getAscendableNextPhase } from "#src/services/character/getAscendableNextPhase";
import { checkIsItemCountsHeld } from "#src/services/inventory/checkIsItemCountsHeld";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// The ascension a character or a weapon makes at its phase's cap into the next phase, as the game takes it: once the
// Player's Adventure Rank reaches the phase's requirement, the wallet holds its Mora and the bag its items, and both are
// Taken. The level stays at the cap the next phase starts from. The one reason it is refused now is returned, and then
// Nothing is taken. A cost a table has not published refuses the ascension rather than making it free
export const ascendToNextPhase = (
  ascension: number,
  level: number,
  phases: (AscensionPhase & Partial<AscensionCost>)[],
  { adventureRank, inventory, wallet }: { adventureRank: number; inventory: Inventory; wallet: Wallet },
): AscensionRefusal | { ascension: number; inventory: Inventory; wallet: Wallet } => {
  const nextPhase = getAscendableNextPhase(phases, ascension, level);
  if (!nextPhase) return AscensionRefusal.Cap;
  else if (
    nextPhase.coinCost === undefined ||
    nextPhase.costItems === undefined ||
    nextPhase.requiredPlayerLevel === undefined
  )
    return AscensionRefusal.Unpublished;
  else if (adventureRank < nextPhase.requiredPlayerLevel) return AscensionRefusal.AdventureRank;
  else if (wallet[Currency.Mora] < nextPhase.coinCost) return AscensionRefusal.Mora;
  else if (!checkIsItemCountsHeld(inventory.items, nextPhase.costItems, 1)) return AscensionRefusal.Materials;
  return {
    ascension: ascension + 1,
    inventory: {
      ...inventory,
      items: nextPhase.costItems.reduce(
        (items, { count, id }) => takeInventoryItems(items, id, count),
        inventory.items,
      ),
    },
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - nextPhase.coinCost },
  };
};
