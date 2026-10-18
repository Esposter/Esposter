import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
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
    | "clearedCamps"
    | "clearedDomainIds"
    | "cookingProgress"
    | "craftedCountMap"
    | "craftingProgress"
    | "enemyRespawnMap"
    | "foundOculusIds"
    | "frostbearingTreeProgress"
    | "inventory"
    | "openedChestIds"
    | "processingJobs"
    | "regionStatueProgressMap"
    | "shownTipIds"
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
  // The tips the world has shown, each once by its id, kept with the save
  const shownTipIds = shallowRef<ReadonlySet<number>>(savedState.shownTipIds);
  // The camps cleared, each once: a camp whose last enemy falls is kept, and one cleared again is not added twice
  const clearedCamps = shallowRef<readonly ClearedCamp[]>(savedState.clearedCamps);
  const clearedDomainIds = shallowRef<ReadonlySet<string>>(savedState.clearedDomainIds);
  const cookingProgress = shallowRef<CookingProgress>(savedState.cookingProgress);
  const processingJobs = shallowRef<Record<number, ProcessingJob>>(savedState.processingJobs);
  const craftedCountMap = shallowRef<ReadonlyMap<number, number>>(savedState.craftedCountMap);
  const craftingProgress = shallowRef<CraftingProgress>(savedState.craftingProgress);
  const enemyRespawnMap = shallowRef<ReadonlyMap<string, string>>(savedState.enemyRespawnMap);
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
      clearedDomainIds,
      cookingProgress,
      craftedCountMap,
      craftingProgress,
      enemyRespawnMap,
      foundOculusIds,
      frostbearingTreeProgress,
      openedChestIds,
      processingJobs,
      regionStatueProgressMap,
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
  events.on("campCleared", (camp) => {
    if (clearedCamps.value.some(({ id }) => id === camp.id)) return;
    clearedCamps.value = [...clearedCamps.value, camp];
  });
  // A defeated enemy's moment of coming back is the save's, so a defeat in a camp with no boss adds it
  const setEnemyRespawnAt = (spawnKey: string, respawnAt: string) => {
    enemyRespawnMap.value = new Map([...enemyRespawnMap.value, [spawnKey, respawnAt]]);
  };
  return {
    achievementProgressMap,
    archiveKillsMap,
    archiveProgressMap,
    clearedCamps,
    clearedDomainIds,
    cookingProgress,
    craftedCountMap,
    craftingProgress,
    enemyRespawnMap,
    foundOculusIds,
    frostbearingTreeProgress,
    inventory,
    openedChestIds,
    processingJobs,
    regionStatueProgressMap,
    setEnemyRespawnAt,
    setInventory,
    setWallet,
    shownTipIds,
    wallet,
    wishHistory,
    wishPityMap,
  };
};
