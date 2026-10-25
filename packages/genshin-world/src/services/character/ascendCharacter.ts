import type { Character } from "#src/models/character/Character";
import type { CharacterAscensionPhase } from "#src/models/character/CharacterAscensionPhase";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { ascendToNextPhase } from "#src/services/character/ascendToNextPhase";

// A character ascended at its phase's cap into the next phase, through the rule a weapon's ascension shares. Undefined
// Where that is refused now, which is what its Ascend button reads, and then nothing is taken
export const ascendCharacter = (
  character: Character,
  {
    adventureRank,
    inventory,
    phases,
    wallet,
  }: { adventureRank: number; inventory: Inventory; phases: CharacterAscensionPhase[]; wallet: Wallet },
): undefined | { character: Character; inventory: Inventory; wallet: Wallet } => {
  const ascended = ascendToNextPhase(character.ascension, character.level, phases, {
    adventureRank,
    inventory,
    wallet,
  });
  if (typeof ascended === "string") return undefined;
  return {
    character: { ...character, ascension: ascended.ascension },
    inventory: ascended.inventory,
    wallet: ascended.wallet,
  };
};
