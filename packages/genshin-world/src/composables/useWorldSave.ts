import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { WorldEvents } from "#src/models/world/WorldEvents";

import { ref, shallowRef, watch } from "vue";

// The bag, the wallet, the wish counters and the achievements' progress the player holds. A change to any of them is a
// Grant the host saves: the changes made in one tick are one grant, so a pickup is one save, a wish is one save with its
// Spend and its pity, and an achievement's progress is saved with the Primogems it paid. Every change to the bag is also
// Announced to the systems that read what it takes in
export const useWorldSave = ({
  emitGrant,
  events,
  savedState,
}: {
  emitGrant: () => void;
  events: WorldEvents;
  savedState: Pick<GenshinSaveState, "achievementProgressMap" | "inventory" | "wallet" | "wishPityMap">;
}) => {
  const inventory = ref<Inventory>(savedState.inventory);
  const wallet = ref<Wallet>(savedState.wallet);
  const wishPityMap = ref(savedState.wishPityMap);
  const achievementProgressMap = shallowRef<ReadonlyMap<number, AchievementProgress>>(
    savedState.achievementProgressMap,
  );
  watch(
    [inventory, wallet, wishPityMap, achievementProgressMap],
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
  return { achievementProgressMap, inventory, setInventory, setWallet, wallet, wishPityMap };
};
