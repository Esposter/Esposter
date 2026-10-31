import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldOfferingDependencies } from "#src/models/world/WorldOfferingDependencies";
import type { Group } from "three";
import type { Ref, ShallowRef } from "vue";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { payOfferingLevels } from "#src/services/offering/payOfferingLevels";
import { claimStatueLevel } from "#src/services/statue/claimStatueLevel";
import { computeStatueLevelEvents } from "#src/services/statue/computeStatueLevelEvents";
import { findOculus } from "#src/services/statue/findOculus";
import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";
import { offerStatueOculi } from "#src/services/statue/offerStatueOculi";
import { readStatueLevels } from "#src/services/statue/readStatueLevels";
import { resonateRegion } from "#src/services/statue/resonateRegion";
import { toStatueRegionProgress, toStatueRegionProgressSave } from "#src/services/statue/statueRegionProgress";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { computed, ref, shallowRef } from "vue";

// The statues' state the world holds: each region's level, the level its rewards are claimed through and the Oculi held,
// And the Oculi found. A touch collects an Oculus and holds it in its region, a resonance starts its region at level one,
// And the Worship Statue offers the Oculi held and pays each level's rewards as that level is claimed, one level an action.
// What the bag has no room for drops where the claim was made
export const useWorldStatues = ({
  characterBody,
  events,
  foundOculusIds,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  inventory,
  materialDataMap,
  nameText,
  placeWorldDrops,
  regionStatueProgressMap,
  screenKind,
  setInventory,
  setWallet,
  wallet,
}: WorldOfferingDependencies & {
  characterBody: Group;
  events: WorldEvents;
  foundOculusIds: ShallowRef<ReadonlySet<string>>;
  regionStatueProgressMap: ShallowRef<ReadonlyMap<string, StatueRegionProgressSave>>;
  screenKind: Ref<ScreenKind>;
}) => {
  // The region's progress is kept as the save holds it, its levels left to the table. A level the region rises to is an
  // Achievement event for its city, read against the level the region held before it
  const setRegionProgress = (regionId: string, progress: StatueRegionProgressSave) => {
    const achievementEvents = computeStatueLevelEvents(regionId, getRegionProgress(regionId).level, progress.level);
    if (achievementEvents.length > 0) events.emit("achievementEvents", achievementEvents);
    regionStatueProgressMap.value = new Map([...regionStatueProgressMap.value, [regionId, progress]]);
  };
  // A region's progress as the save holds it, which a region no save holds yet starts from at none
  const getRegionProgress = (regionId: string): StatueRegionProgressSave =>
    regionStatueProgressMap.value.get(regionId) ?? { claimedLevel: 0, heldCount: 0, level: 0 };
  const payLevels = (gainedLevels: StatueLevel[], source: Pick<WorldDrop, "id" | "position">) => {
    const paid = payOfferingLevels(gainedLevels, inventory.value, wallet.value, nameText, materialDataMap);
    setInventory(paid.inventory);
    setWallet(paid.wallet);
    placeWorldDrops(source, paid.overflowItems);
    return paid.adventureExp;
  };
  // A region's statue levels, read by the key its publish wrote. A region no publish wrote has no levels to pay
  const readRegionStatueLevels = (regionId: string): Promise<StatueLevel[]> => {
    const key: `statueLevels/${string}` = `statueLevels/${regionId}`;
    return checkIsGameDataKey(key) ? readStatueLevels(gameDataBaseUrl, key) : Promise.resolve([]);
  };
  // The levels a region's statues take, handed to the caller once they have arrived, so the Worship Statue opens with its
  // Screen showing each level and its rewards, and a resonance reads them before it acts
  const readRegionLevels = getSynchronizedFunction((regionId: string, onRead: (levels: StatueLevel[]) => void) =>
    getResultAsync(() => readRegionStatueLevels(regionId)).match(onRead, (error) => {
      console.error(error);
    }),
  );
  // Touching an Oculus collects it once, holding it in its region, and gives its Adventure EXP
  // A touch that lands while an Oculus's levels are still arriving waits for them, rather than reading them again
  const collectingOculusIds = new Set<string>();
  const collectOculus = getSynchronizedFunction(
    async (regionId: string, source: Pick<WorldDrop, "id" | "position">) => {
      if (collectingOculusIds.has(source.id)) return;
      collectingOculusIds.add(source.id);
      await getResultAsync(() => readRegionStatueLevels(regionId)).match(
        (levels) => {
          collectingOculusIds.delete(source.id);
          const progress = getRegionProgress(regionId);
          const isNewlyFound = !foundOculusIds.value.has(source.id);
          const found = findOculus(foundOculusIds.value, source.id, toStatueRegionProgress(progress, levels));
          foundOculusIds.value = found.foundOculusIds;
          if (isNewlyFound && found.foundOculusIds.has(source.id)) events.emit("oculusFound");
          gainWorldAdventureExp(found.adventureExp);
          setRegionProgress(regionId, toStatueRegionProgressSave(found.progress, progress.claimedLevel));
        },
        (error) => {
          collectingOculusIds.delete(source.id);
          console.error(error);
        },
      );
    },
  );
  // A resonance with a statue starts its region at level one. Level one is reached, its rewards waiting to be claimed
  const resonateStatue = (landmarkId: string) => {
    const regionId = getStatueRegionId(landmarkId);
    if (regionId === undefined) return;
    readRegionLevels(regionId, (levels) => {
      const progress = getRegionProgress(regionId);
      const resonated = resonateRegion(toStatueRegionProgress(progress, levels));
      setRegionProgress(regionId, toStatueRegionProgressSave(resonated, progress.claimedLevel));
    });
  };
  // The Worship Statue offers the Oculi a started region holds, reaching each level they complete and leaving its rewards
  // To be claimed
  const offerOculi = (regionId: string, levels: StatueLevel[]) => {
    const progress = getRegionProgress(regionId);
    const offered = offerStatueOculi(toStatueRegionProgress(progress, levels));
    setRegionProgress(regionId, toStatueRegionProgressSave(offered, progress.claimedLevel));
  };
  // A claim takes the next level the region has reached, paying its rewards once; a region with none left to claim is left
  // As it is
  const claimLevel = (regionId: string, levels: StatueLevel[], source: Pick<WorldDrop, "id" | "position">) => {
    const progress = getRegionProgress(regionId);
    const offeringProgress = toStatueRegionProgress(progress, levels);
    const claim = claimStatueLevel(offeringProgress, progress.claimedLevel);
    if (!claim.claimed) return;
    gainWorldAdventureExp(payLevels([claim.claimed], source));
    setRegionProgress(regionId, toStatueRegionProgressSave(offeringProgress, claim.claimedLevel));
  };
  // The Worship Statue on screen: the statue it was opened at and the region's levels as the screen read them, which
  // Its Offer and claim act on
  const worshipLandmarkId = ref("");
  const worshipLevels = shallowRef<StatueLevel[]>([]);
  const worshipRegionId = computed(() =>
    worshipLandmarkId.value ? getStatueRegionId(worshipLandmarkId.value) : undefined,
  );
  // F on a resonated statue opens its Worship Statue, its levels read first so the screen shows each level and its
  // Rewards
  const openWorship = (landmarkId: string) => {
    const regionId = getStatueRegionId(landmarkId);
    if (regionId === undefined) return;
    readRegionLevels(regionId, (levels) => {
      worshipLandmarkId.value = landmarkId;
      worshipLevels.value = levels;
      screenKind.value = ScreenKind.Worship;
    });
  };
  const offerWorship = () => {
    if (worshipRegionId.value !== undefined) offerOculi(worshipRegionId.value, worshipLevels.value);
  };
  // A claim takes the next level the region has reached, its rewards dropping where the Worship Statue was opened if
  // The bag has no room for them
  const claimWorship = () => {
    if (worshipRegionId.value === undefined) return;
    claimLevel(worshipRegionId.value, worshipLevels.value, {
      id: worshipLandmarkId.value,
      position: characterBody.position,
    });
  };
  // The name of a reward's item in the reader's language, which a level pays by its material
  const getWorshipItemName = (itemId: number) => nameText[materialDataMap.get(itemId)?.nameTextId ?? ""] ?? "";
  return {
    claimWorship,
    collectOculus,
    getRegionProgress,
    getWorshipItemName,
    offerWorship,
    openWorship,
    resonateStatue,
    worshipLevels,
    worshipRegionId,
  };
};
