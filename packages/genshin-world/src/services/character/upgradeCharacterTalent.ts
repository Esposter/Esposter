import type { Character } from "#src/models/character/Character";
import type { CombatTalent } from "#src/models/character/CombatTalent";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { upgradeTalent } from "#src/services/character/upgradeTalent";

// The roster with one character's combat talent raised by upgradeTalent, with the bag and the wallet it leaves: the
// Character is replaced where it stands, so every other character keeps its place in the order
export const upgradeCharacterTalent = (
  characters: Character[],
  character: Character,
  talent: CombatTalent,
  upgrades: readonly TalentUpgrade[],
  { inventory, wallet }: { inventory: Inventory; wallet: Wallet },
): { characters: Character[]; inventory: Inventory; wallet: Wallet } => {
  const raised = upgradeTalent(character, talent, upgrades, { inventory, wallet });
  return {
    characters: characters.map((candidate) => (candidate.id === character.id ? raised.character : candidate)),
    inventory: raised.inventory,
    wallet: raised.wallet,
  };
};
