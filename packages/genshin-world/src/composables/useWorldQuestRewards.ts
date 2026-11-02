import type { Character } from "#src/models/character/Character";
import type { QuestRewardItem } from "#src/models/quest/QuestRewardItem";
import type { Ref } from "vue";

import { gainCharacterExp } from "#src/services/character/gainCharacterExp";
import { grantQuestRewards } from "#src/services/quest/grantQuestRewards";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";

// Each quest's finish pays its rewards as it finishes: the bag and the wallet take the items, the Adventure Rank takes
// The Adventure EXP after them, so the rank reads the wallet they left, and the deployed team's characters take the
// Character EXP. A finish is recorded once, so a reload pays nothing
export const useWorldQuestRewards = ({
  characters,
  gainAdventureExp,
  getDeployedCharacterIds,
  getMaxLevel,
  setCharacters,
}: {
  characters: Ref<Character[]>;
  gainAdventureExp: (amount: number) => void;
  getDeployedCharacterIds: () => number[];
  getMaxLevel: (character: Character) => number;
  setCharacters: (nextCharacters: Character[]) => void;
}) => {
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet } = storeToRefs(worldSessionStore);
  const { events, setInventory, setWallet } = worldSessionStore;
  // A reward is paid through one path, whether a quest finishes or a talk gives it
  const grantRewards = (rewards: QuestRewardItem[]) => {
    const granted = grantQuestRewards(
      rewards,
      inventory.value,
      wallet.value,
      worldSessionStore.nameText,
      worldSessionStore.materialDataMap,
    );
    setInventory(granted.inventory);
    setWallet(granted.wallet);
    if (granted.characterExp > 0)
      setCharacters(gainCharacterExp(characters.value, getDeployedCharacterIds(), granted.characterExp, getMaxLevel));
    if (granted.adventureExp > 0) gainAdventureExp(granted.adventureExp);
  };
  events.on("finishQuest", ({ rewards }) => {
    grantRewards(rewards);
  });
  return { grantRewards };
};
