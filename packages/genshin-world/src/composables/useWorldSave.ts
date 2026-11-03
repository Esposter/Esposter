import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { InventoryDestruction } from "#src/models/inventory/InventoryDestruction";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";

import { setTravelerBirthday } from "#src/services/profile/setTravelerBirthday";
import { withoutMapEntry } from "#src/services/shared/withoutMapEntry";
import { useWorldAchievementsStore } from "#src/store/achievements";
import { useWorldArchiveStore } from "#src/store/archive";
import { useWorldChestsStore } from "#src/store/chests";
import { useWorldSessionStore } from "#src/store/session";
import { useWorldStatuesStore } from "#src/store/statues";
import { ref, shallowRef, watch } from "vue";

// The wish counters and the bench's crafting the player holds, beside the bag and the wallet the session store holds and
// The progress and defeats the achievements', the Archive's, the chests' and the statues' stores hold.
// A change to any of them is a grant the host saves: the changes made in one tick are one grant, so a pickup is one save, a
// Wish is one save with its spend and its pity, and an achievement's progress is saved with the Primogems it paid
export const useWorldSave = ({
  emitGrant,
  savedState,
}: {
  emitGrant: () => void;
  savedState: Pick<
    GenshinSaveState,
    | "bossDefeatMap"
    | "clearedCamps"
    | "clearedDomainIds"
    | "cookingProgress"
    | "craftedCountMap"
    | "craftingProgress"
    | "enemyRespawnMap"
    | "frostbearingTreeProgress"
    | "namecardItemId"
    | "processingJobs"
    | "queuedTipIds"
    | "shownTipIds"
    | "travelerBirthday"
    | "wishHistory"
    | "wishPityMap"
  >;
}) => {
  const worldAchievementsStore = useWorldAchievementsStore();
  const worldArchiveStore = useWorldArchiveStore();
  const worldChestsStore = useWorldChestsStore();
  const worldSessionStore = useWorldSessionStore();
  const worldStatuesStore = useWorldStatuesStore();
  const namecardItemId = ref(savedState.namecardItemId);
  // The Traveler's birthday, set once from the profile and kept with the save once it is set
  const travelerBirthday = shallowRef<TravelerBirthdaySave | undefined>(savedState.travelerBirthday);
  const wishHistory = ref(savedState.wishHistory);
  const wishPityMap = ref(savedState.wishPityMap);
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
  const frostbearingTreeProgress = shallowRef<OfferingProgressSave>(savedState.frostbearingTreeProgress);
  watch(
    [
      () => worldSessionStore.inventory,
      () => worldSessionStore.wallet,
      wishPityMap,
      () => worldAchievementsStore.achievementProgressMap,
      () => worldArchiveStore.archiveKillsMap,
      () => worldArchiveStore.archiveProgressMap,
      bossDefeatMap,
      clearedCamps,
      clearedDomainIds,
      cookingProgress,
      craftedCountMap,
      craftingProgress,
      enemyRespawnMap,
      () => worldStatuesStore.foundOculusIds,
      frostbearingTreeProgress,
      () => worldChestsStore.openedChestIds,
      processingJobs,
      () => worldStatuesStore.regionStatueProgressMap,
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
    frostbearingTreeProgress,
    namecardItemId,
    processingJobs,
    queuedTipIds,
    setBossDefeatAt,
    setEnemyRespawnAt,
    setNamecardItemId,
    shownTipIds,
    travelerBirthday,
    wishHistory,
    wishPityMap,
  };
};
