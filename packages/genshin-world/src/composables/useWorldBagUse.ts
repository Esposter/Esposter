import type { InventoryUseContext } from "#src/models/inventory/InventoryUseContext";
import type { WorldBagUseOptions } from "#src/models/inventory/WorldBagUseOptions";

import { useInventoryEntry } from "#src/services/inventory/useInventoryEntry";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { useWorldCookingStore } from "#src/store/cooking";
import { useWorldPartyStore } from "#src/store/party";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";

// Using an entry of the bag: the entry's use is read off the bag, the dishes, the recipes and the blueprints, and what it gives
// Back is written into the bag, the wallet and the progress the use changed. A use the entry has none of changes nothing
export const useWorldBagUse = ({
  blueprintMap,
  craftingProgress,
  craftingRecipeMap,
  dishUseMap,
  forgeProgress,
  forgeRecipeMap,
  getMemberMaxHealth,
  homeProgress,
  kitContext,
}: WorldBagUseOptions) => {
  const worldCookingStore = useWorldCookingStore();
  const { cookingProgress, instructionRecipeMap } = storeToRefs(worldCookingStore);
  const worldPartyStore = useWorldPartyStore();
  const { party } = worldPartyStore;
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet } = storeToRefs(worldSessionStore);
  const { getWorldNow, setInventory, setWallet } = worldSessionStore;
  const useBagEntry = (entryId: number, count: number) => {
    const bagUseContext: InventoryUseContext = {
      blueprintMap: blueprintMap.value,
      cookingProgress: cookingProgress.value,
      craftingProgress: craftingProgress.value,
      craftingRecipeMap: craftingRecipeMap.value,
      dishUseMap: dishUseMap.value,
      forgeProgress: forgeProgress.value,
      forgeRecipeMap: forgeRecipeMap.value,
      homeProgress: homeProgress.value,
      instructionRecipeMap: instructionRecipeMap.value,
    };
    const use = useInventoryEntry(inventory.value, entryId, {
      ...bagUseContext,
      count,
      eaterId: getActiveCharacterId(party),
      getMaxHealth: (characterId) => getMemberMaxHealth(characterId) ?? 0,
      kitEffectState: kitContext.kitEffectState,
      now: getWorldNow(),
      party,
      wallet: wallet.value,
    });
    if (!use) return;
    setInventory(use.inventory);
    if (use.wallet) setWallet(use.wallet);
    if (use.cookingProgress) cookingProgress.value = use.cookingProgress;
    if (use.craftingProgress) craftingProgress.value = use.craftingProgress;
    if (use.forgeProgress) forgeProgress.value = use.forgeProgress;
    if (use.homeProgress) homeProgress.value = use.homeProgress;
  };
  return { useBagEntry };
};
