import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { InventoryDestruction } from "#src/models/inventory/InventoryDestruction";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";

import { setTravelerBirthday } from "#src/services/profile/setTravelerBirthday";
import { withoutMapEntry } from "#src/services/shared/withoutMapEntry";
import { useWorldArchiveStore } from "#src/store/archive";
import { useWorldChestsStore } from "#src/store/chests";
import { useWorldSessionStore } from "#src/store/session";
import { ref, shallowRef, watch } from "vue";

// The wish counters, the achievements' progress and the bench's crafting the player holds, beside the bag and the wallet
// The session store holds and the Archive's progress and defeats its own store holds. A change to any of them is a grant the host saves: the
// Changes made in one tick are one grant, so a pickup is one save, a wish is one save with its spend and its pity, and an
// Achievement's progress is saved with the Primogems it paid
export const useWorldSave = ({
  emitGrant,
  savedState,
}: {
  emitGrant: () => void;
  savedState: Pick<
    GenshinSaveState,
    | "achievementProgressMap"
    | "bossDefeatMap"
    | "clearedCamps"
    | "clearedDomainIds"
    | "cookingProgress"
    | "craftedCountMap"
    | "craftingProgress"
    | "enemyRespawnMap"
    | "foundOculusIds"
    | "frostbearingTreeProgress"
    | "namecardItemId"
    | "processingJobs"
    | "queuedTipIds"
    | "regionStatueProgressMap"
    | "shownTipIds"
    | "travelerBirthday"
    | "wishHistory"
    | "wishPityMap"
  >;
}) => {
  const worldArchiveStore = useWorldArchiveStore();
  const worldChestsStore = useWorldChestsStore();
  const worldSessionStore = useWorldSessionStore();
  const namecardItemId = ref(savedState.namecardItemId);
  // The Traveler's birthday, set once from the profile and kept with the save once it is set
  const travelerBirthday = shallowRef<TravelerBirthdaySave | undefined>(savedState.travelerBirthday);
  const wishHistory = ref(savedState.wishHistory);
  const wishPityMap = ref(savedState.wishPityMap);
  const achievementProgressMap = shallowRef<ReadonlyMap<number, AchievementProgress>>(
    savedState.achievementProgressMap,
  );
  // The tips the world has shown, each once by its id, kept with the save, and the tips it has triggered and not yet shown
  const shownTipIds = shallowRef<ReadonlySet<number>>(savedState.shownTipIds);
  const queuedTipIds = shallowRef<readonly number[]>(savedState.queuedTipIds);
  // The camps cleared, each once: a camp whose last enemy falls is kept, and one cleared again is not added twice
  const clearedCamps = shallowRef<readonly ClearedCamp[]>(savedState.clearedCamps);
  const clearedDomainIds = shallowRef<ReadonlySet<string>>(savedState.clearedDomainIds);
  const cookingProgress = shallowRef<CookingProgress>(savedState.cookingProgress);
  const processingJobs = shallowRef<Record<number, ProcessingJob>>(savedState.processingJobs);
  const craftedCountMap = shallowRef<ReadonlyMap<number, number>>(savedState.craftedCountMap);
  const craftingProgress = shallowRef<CraftingProgress>(savedState.craftingProgress);
  const bossDefeatMap = shallowRef<ReadonlyMap<string, string>>(savedState.bossDefeatMap);
  const enemyRespawnMap = shallowRef<ReadonlyMap<string, string>>(savedState.enemyRespawnMap);
  const foundOculusIds = shallowRef<ReadonlySet<string>>(savedState.foundOculusIds);
  const frostbearingTreeProgress = shallowRef<OfferingProgressSave>(savedState.frostbearingTreeProgress);
  const regionStatueProgressMap = shallowRef<ReadonlyMap<string, StatueRegionProgressSave>>(
    savedState.regionStatueProgressMap,
  );
  watch(
    [
      () => worldSessionStore.inventory,
      () => worldSessionStore.wallet,
      wishPityMap,
      achievementProgressMap,
      () => worldArchiveStore.archiveKillsMap,
      () => worldArchiveStore.archiveProgressMap,
      bossDefeatMap,
      clearedCamps,
      clearedDomainIds,
      cookingProgress,
      craftedCountMap,
      craftingProgress,
      enemyRespawnMap,
      foundOculusIds,
      frostbearingTreeProgress,
      () => worldChestsStore.openedChestIds,
      processingJobs,
      regionStatueProgressMap,
      travelerBirthday,
    ],
    () => {
      emitGrant();
    },
    { flush: "pre" },
  );
  // A destroy's bag and wallet are applied together, since what it returns may be currency
  const applyDestruction = ({ inventory: nextInventory, wallet: nextWallet }: InventoryDestruction) => {
    worldSessionStore.setInventory(nextInventory);
    worldSessionStore.setWallet(nextWallet);
  };
  worldSessionStore.events.on("campCleared", (camp) => {
    if (clearedCamps.value.some(({ id }) => id === camp.id)) return;
    clearedCamps.value = [...clearedCamps.value, camp];
  });
  // A defeated enemy's moment of coming back is the save's, so a defeat in a camp with no boss adds it
  const setEnemyRespawnAt = (spawnKey: string, respawnAt: string) => {
    enemyRespawnMap.value = new Map([...enemyRespawnMap.value, [spawnKey, respawnAt]]);
  };
  // A defeated boss's moment of defeat is the save's too, since its return waits on a claim or a teleport the save keeps
  const setBossDefeatAt = (spawnKey: string, defeatedAt: string) => {
    bossDefeatMap.value = new Map([...bossDefeatMap.value, [spawnKey, defeatedAt]]);
  };
  // A boss that comes back has no defeat left in the save, its blossom having been claimed or left behind by a teleport
  const forgetBossDefeat = (spawnKey: string) => {
    bossDefeatMap.value = withoutMapEntry(bossDefeatMap.value, spawnKey);
  };
  const setNamecardItemId = (nextItemId: number) => {
    namecardItemId.value = nextItemId;
  };
  // The birthday the profile's dialog confirms is set once: a held one is kept, and a date its month does not hold is refused
  const chooseTravelerBirthday = (chosen: TravelerBirthdaySave) => {
    travelerBirthday.value = setTravelerBirthday(travelerBirthday.value, chosen);
  };
  return {
    achievementProgressMap,
    applyDestruction,
    bossDefeatMap,
    chooseTravelerBirthday,
    clearedCamps,
    clearedDomainIds,
    cookingProgress,
    craftedCountMap,
    craftingProgress,
    enemyRespawnMap,
    forgetBossDefeat,
    foundOculusIds,
    frostbearingTreeProgress,
    namecardItemId,
    processingJobs,
    queuedTipIds,
    regionStatueProgressMap,
    setBossDefeatAt,
    setEnemyRespawnAt,
    setNamecardItemId,
    shownTipIds,
    travelerBirthday,
    wishHistory,
    wishPityMap,
  };
};
