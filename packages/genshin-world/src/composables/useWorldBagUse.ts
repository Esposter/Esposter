import type { WorldBagUseOptions } from "#src/models/inventory/WorldBagUseOptions";

import { useInventoryEntry } from "#src/services/inventory/useInventoryEntry";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";

// Using an entry of the bag: the entry's use is read off the bag, the dishes and the recipes, and what it gives back is
// Written into the bag, the wallet and the cooking progress. A use the entry has none of changes nothing
export const useWorldBagUse = ({
  cookingProgress,
  dishUseMap,
  getMemberMaxHealth,
  instructionRecipeMap,
  kitContext,
  party,
}: WorldBagUseOptions) => {
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
