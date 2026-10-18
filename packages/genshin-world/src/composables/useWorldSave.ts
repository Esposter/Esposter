import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { WorldEvents } from "#src/models/world/WorldEvents";

import { ref, shallowRef, watch } from "vue";

// The bag, the wallet, the wish counters, the achievements' progress, the bench's crafting and the Archive's entries and
// Defeats the player holds. A change to any of them is a grant the host saves: the changes made in one tick are one grant,
// So a pickup is one save, a wish is one save with its spend and its pity, and an achievement's progress is saved with the
// Primogems it paid. Every change to the
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
    | "achievementProgressMap"
    | "archiveKillsMap"
    | "archiveProgressMap"
    | "craftedCountMap"
    | "craftingProgress"
    | "frostbearingTreeProgress"
    | "inventory"
    | "openedChestIds"
    | "wallet"
    | "wishHistory"
    | "wishPityMap"
  >;
}) => {
  const inventory = ref<Inventory>(savedState.inventory);
  const wallet = ref<Wallet>(savedState.wallet);
  const wishHistory = ref(savedState.wishHistory);
  const wishPityMap = ref(savedState.wishPityMap);
  const achievementProgressMap = shallowRef<ReadonlyMap<number, AchievementProgress>>(
    savedState.achievementProgressMap,
  );
  const archiveKillsMap = shallowRef<ArchiveKills>(savedState.archiveKillsMap);
  const archiveProgressMap = shallowRef<ArchiveProgress>(savedState.archiveProgressMap);
  const craftedCountMap = shallowRef<ReadonlyMap<number, number>>(savedState.craftedCountMap);
  const craftingProgress = shallowRef<CraftingProgress>(savedState.craftingProgress);
  const frostbearingTreeProgress = shallowRef<OfferingProgressSave>(savedState.frostbearingTreeProgress);
  const openedChestIds = shallowRef<ReadonlySet<string>>(savedState.openedChestIds);
  watch(
    [
      inventory,
      wallet,
      wishPityMap,
      achievementProgressMap,
      archiveKillsMap,
      archiveProgressMap,
      craftedCountMap,
      craftingProgress,
      frostbearingTreeProgress,
      openedChestIds,
    ],
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
    archiveKillsMap,
    archiveProgressMap,
    craftedCountMap,
    craftingProgress,
    frostbearingTreeProgress,
    inventory,
    openedChestIds,
    setInventory,
    setWallet,
    wallet,
    wishHistory,
    wishPityMap,
  };
};
