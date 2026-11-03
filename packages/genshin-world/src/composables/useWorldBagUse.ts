import type { WorldBagUseOptions } from "#src/models/inventory/WorldBagUseOptions";

import { useInventoryEntry } from "#src/services/inventory/useInventoryEntry";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { useWorldCookingStore } from "#src/store/cooking";
import { useWorldPartyStore } from "#src/store/party";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";

// Using an entry of the bag: the entry's use is read off the bag, the dishes and the recipes, and what it gives back is
// Written into the bag, the wallet and the cooking progress. A use the entry has none of changes nothing
export const useWorldBagUse = ({ dishUseMap, getMemberMaxHealth, kitContext }: WorldBagUseOptions) => {
  const worldCookingStore = useWorldCookingStore();
  const { cookingProgress, instructionRecipeMap } = storeToRefs(worldCookingStore);
  const worldPartyStore = useWorldPartyStore();
  const { party } = worldPartyStore;
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet } = storeToRefs(worldSessionStore);
  const { getWorldNow, setInventory, setWallet } = worldSessionStore;
  const useBagEntry = (entryId: number, count: number) => {
    const use = useInventoryEntry(inventory.value, entryId, {
      cookingProgress: cookingProgress.value,
      count,
      dishUseMap: dishUseMap.value,
      eaterId: getActiveCharacterId(party),
      getMaxHealth: (characterId) => getMemberMaxHealth(characterId) ?? 0,
      instructionRecipeMap: instructionRecipeMap.value,
      kitEffectState: kitContext.kitEffectState,
      now: getWorldNow(),
      party,
      wallet: wallet.value,
    });
    if (!use) return;
    setInventory(use.inventory);
    if (use.wallet) setWallet(use.wallet);
    if (use.cookingProgress) cookingProgress.value = use.cookingProgress;
  };
  return { useBagEntry };
};
