import type { Character } from "#src/models/character/Character";
import type { CharacterAscensionPhase } from "#src/models/character/CharacterAscensionPhase";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { getAscendableNextPhase } from "#src/services/character/getAscendableNextPhase";
import { checkIsItemCountsHeld } from "#src/services/inventory/checkIsItemCountsHeld";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";

// A character ascended at its phase's cap into the next phase, as the game takes it: the next phase's Mora and items are
// Taken once the player's Adventure Rank reaches the phase's requirement. Its level stays at the cap the next phase starts
// From. Undefined where that is refused now, and then nothing is taken
export const ascendCharacter = (
  character: Character,
  {
    adventureRank,
    inventory,
    phases,
    wallet,
  }: { adventureRank: number; inventory: Inventory; phases: CharacterAscensionPhase[]; wallet: Wallet },
): undefined | { character: Character; inventory: Inventory; wallet: Wallet } => {
  const nextPhase = getAscendableNextPhase(phases, character.ascension, character.level);
  if (
    nextPhase?.coinCost === undefined ||
    nextPhase.costItems === undefined ||
    nextPhase.requiredPlayerLevel === undefined ||
    adventureRank < nextPhase.requiredPlayerLevel ||
    wallet[Currency.Mora] < nextPhase.coinCost ||
    !checkIsItemCountsHeld(inventory.items, nextPhase.costItems, 1)
  )
    return undefined;
  return {
    character: { ...character, ascension: character.ascension + 1 },
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
