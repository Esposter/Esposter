import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { QuestRewardItem } from "#src/models/quest/Quest";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { gainCharacterExp } from "#src/services/character/gainCharacterExp";
import { grantQuestRewards } from "#src/services/quest/grantQuestRewards";

// Each quest's finish pays its rewards as it finishes: the bag and the wallet take the items, the Adventure Rank takes
// The Adventure EXP after them, so the rank reads the wallet they left, and the deployed team's characters take the
// Character EXP. A finish is recorded once, so a reload pays nothing
export const useWorldQuestRewards = ({
  characters,
  events,
  gainAdventureExp,
  getDeployedCharacterIds,
  getMaxLevel,
  inventory,
  materialDataMap,
  names,
  setCharacters,
  setInventory,
  setWallet,
  wallet,
}: {
  characters: Ref<Character[]>;
  events: WorldEvents;
  gainAdventureExp: (amount: number) => void;
  getDeployedCharacterIds: () => number[];
  getMaxLevel: (character: Character) => number;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  setCharacters: (nextCharacters: Character[]) => void;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  // A reward is paid through one path, whether a quest finishes or a talk gives it
  const grantRewards = (rewards: QuestRewardItem[]) => {
    const granted = grantQuestRewards(rewards, inventory.value, wallet.value, names, materialDataMap);
    setInventory(granted.inventory);
    setWallet(granted.wallet);
    if (granted.characterExp > 0)
      setCharacters(gainCharacterExp(characters.value, getDeployedCharacterIds(), granted.characterExp, getMaxLevel));
    if (granted.adventureExp > 0) gainAdventureExp(granted.adventureExp);
  };
  events.on("finishQuest", ({ rewards }) => grantRewards(rewards));
  return { grantRewards };
};
