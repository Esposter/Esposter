import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { WorldEvents } from "#src/models/world/WorldEvents";

import { ref, shallowRef, watch } from "vue";

// The bag, the wallet, the wish counters, the achievements' progress and the bench's crafting the player holds. A change to
// Any of them is a grant the host saves: the changes made in one tick are one grant, so a pickup is one save, a wish is one
// Save with its spend and its pity, and an achievement's progress is saved with the Primogems it paid. Every change to the
// Bag is also announced to the systems that read what it takes in
export const useWorldSave = ({
  emitGrant,
  events,
  savedState,
}: {
  emitGrant: () => void;
  events: WorldEvents;
  savedState: Pick<
    GenshinSaveState,
    "achievementProgressMap" | "craftedCountMap" | "craftingProgress" | "inventory" | "wallet" | "wishPityMap"
  >;
}) => {
  const inventory = ref<Inventory>(savedState.inventory);
  const wallet = ref<Wallet>(savedState.wallet);
  const wishPityMap = ref(savedState.wishPityMap);
  const achievementProgressMap = shallowRef<ReadonlyMap<number, AchievementProgress>>(
    savedState.achievementProgressMap,
  );
  const craftedCountMap = shallowRef<ReadonlyMap<number, number>>(savedState.craftedCountMap);
  const craftingProgress = shallowRef<CraftingProgress>(savedState.craftingProgress);
  watch(
    [inventory, wallet, wishPityMap, achievementProgressMap, craftedCountMap, craftingProgress],
    () => {
      emitGrant();
    },
    { flush: "pre" },
  );
  // Every change to the bag goes through here, so the Archive opens the entries of what the bag takes in
  const setInventory = (nextInventory: Inventory) => {
    inventory.value = nextInventory;
    events.emit("bagChange", nextInventory);
  };
  const setWallet = (nextWallet: Wallet) => {
    wallet.value = nextWallet;
  };
  return {
    achievementProgressMap,
    craftedCountMap,
    craftingProgress,
    inventory,
    setInventory,
    setWallet,
    wallet,
    wishPityMap,
  };
};
