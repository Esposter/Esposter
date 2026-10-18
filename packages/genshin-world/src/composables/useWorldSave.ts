import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { WorldEvents } from "#src/models/world/WorldEvents";

import { computeBagObtainEvents } from "#src/services/achievement/computeBagObtainEvents";
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
    | "clearedCamps"
    | "craftedCountMap"
    | "craftingProgress"
    | "foundOculusIds"
    | "frostbearingTreeProgress"
    | "inventory"
    | "openedChestIds"
    | "regionStatueProgressMap"
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
  // The camps cleared, each once: a camp whose last enemy falls is kept, and one cleared again is not added twice
  const clearedCamps = shallowRef<readonly ClearedCamp[]>(savedState.clearedCamps);
  const craftedCountMap = shallowRef<ReadonlyMap<number, number>>(savedState.craftedCountMap);
  const craftingProgress = shallowRef<CraftingProgress>(savedState.craftingProgress);
  const foundOculusIds = shallowRef<ReadonlySet<string>>(savedState.foundOculusIds);
  const frostbearingTreeProgress = shallowRef<OfferingProgressSave>(savedState.frostbearingTreeProgress);
  const openedChestIds = shallowRef<ReadonlySet<string>>(savedState.openedChestIds);
  const regionStatueProgressMap = shallowRef<ReadonlyMap<string, StatueRegionProgressSave>>(
    savedState.regionStatueProgressMap,
  );
  watch(
    [
      inventory,
      wallet,
      wishPityMap,
      achievementProgressMap,
      archiveKillsMap,
      archiveProgressMap,
      clearedCamps,
      craftedCountMap,
      craftingProgress,
      foundOculusIds,
      frostbearingTreeProgress,
      openedChestIds,
      regionStatueProgressMap,
    ],
    () => {
      emitGrant();
    },
    { flush: "pre" },
  );
  // Every change to the bag goes through here, so the Archive opens the entries of what the bag takes in, and the
  // Achievements count what it takes in as their obtain doings
  const setInventory = (nextInventory: Inventory) => {
    const obtainEvents = computeBagObtainEvents(inventory.value.items, nextInventory.items);
    inventory.value = nextInventory;
    events.emit("bagChange", nextInventory);
    if (obtainEvents.length > 0) events.emit("achievementEvents", obtainEvents);
  };
  const setWallet = (nextWallet: Wallet) => {
    wallet.value = nextWallet;
  };
  events.on("campCleared", (camp) => {
    if (clearedCamps.value.some(({ id }) => id === camp.id)) return;
    clearedCamps.value = [...clearedCamps.value, camp];
  });
  return {
    achievementProgressMap,
    archiveKillsMap,
    archiveProgressMap,
    clearedCamps,
    craftedCountMap,
    craftingProgress,
    foundOculusIds,
    frostbearingTreeProgress,
    inventory,
    openedChestIds,
    regionStatueProgressMap,
    setInventory,
    setWallet,
    wallet,
    wishHistory,
    wishPityMap,
  };
};
