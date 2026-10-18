import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { Ref, ShallowRef } from "vue";

import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { payOfferingLevels } from "#src/services/offering/payOfferingLevels";
import { findOculus } from "#src/services/statue/findOculus";
import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";
import { offerCollectedOculi } from "#src/services/statue/offerCollectedOculi";
import { readStatueLevels } from "#src/services/statue/readStatueLevels";
import { resonateRegion } from "#src/services/statue/resonateRegion";
import { toStatueRegionProgress, toStatueRegionProgressSave } from "#src/services/statue/statueRegionProgress";
import { getResultAsync } from "@esposter/shared";

// The statues' state the world holds: each region's level, the Oculi it has collected and the Oculi offered toward its next
// Level, and the Oculi found. A touch collects an Oculus, and a resonance starts its region. The Worship Statue offers the
// Collected Oculi, paying each level it reaches as a bag offer does. What the bag has no room for drops where the touch,
// The resonance or the offer was made
export const useWorldStatues = ({
  foundOculusIds,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  inventory,
  materialDataMap,
  nameText,
  placeWorldDrops,
  regionStatueProgressMap,
  setInventory,
  setWallet,
  wallet,
}: {
  foundOculusIds: ShallowRef<ReadonlySet<string>>;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
  regionStatueProgressMap: ShallowRef<ReadonlyMap<string, StatueRegionProgressSave>>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  // A region's progress is kept as the save holds it, its levels left to the table the levels are read from
  const setRegionProgress = (regionId: string, progress: StatueRegionProgressSave) => {
    regionStatueProgressMap.value = new Map([...regionStatueProgressMap.value, [regionId, progress]]);
  };
  // A region's progress as the save holds it, which a region no save holds yet starts from at none
  const getRegionProgress = (regionId: string): StatueRegionProgressSave =>
    regionStatueProgressMap.value.get(regionId) ?? { collectedCount: 0, heldCount: 0, level: 0 };
  // The levels of the region a statue belongs to, read from the game's table, or none for a landmark outside any region
  const readStatueLevelsOf = (landmarkId: string): Promise<StatueLevel[]> => {
    const regionId = getStatueRegionId(landmarkId);
    return regionId === undefined ? Promise.resolve([]) : readRegionStatueLevels(regionId);
  };
  // The progress of the region a statue belongs to, or none for a landmark outside any region
  const getStatueProgress = (landmarkId: string): StatueRegionProgressSave | undefined => {
    const regionId = getStatueRegionId(landmarkId);
    return regionId === undefined ? undefined : getRegionProgress(regionId);
  };
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
  // Touching an Oculus collects it into its region's collected count and gains its Adventure EXP. Nothing is paid until the
  // Region's Worship Statue offers it, so a touch reads no levels
  const collectOculus = (regionId: string, oculusId: string) => {
    const progress = getRegionProgress(regionId);
    const found = findOculus(foundOculusIds.value, oculusId, progress.collectedCount);
    foundOculusIds.value = found.foundOculusIds;
    gainWorldAdventureExp(found.adventureExp);
    setRegionProgress(regionId, { ...progress, collectedCount: found.collectedCount });
  };
  // A resonance with a statue starts its region at level one, paying that level's rewards once
  const resonateStatue = (landmarkId: string, source: Pick<WorldDrop, "id" | "position">) => {
    const regionId = getStatueRegionId(landmarkId);
    if (regionId === undefined) return;
    getResultAsync(() => readRegionStatueLevels(regionId)).match(
      (levels) => {
        const progress = getRegionProgress(regionId);
        const resonated = resonateRegion(toStatueRegionProgress(progress, levels));
        gainWorldAdventureExp(payLevels(resonated.gainedLevels, source));
        setRegionProgress(regionId, toStatueRegionProgressSave(resonated.progress, progress.collectedCount));
      },
      (error) => {
        console.error(error);
      },
    );
  };
  // The Worship Statue offers its region's collected Oculi: the levels they complete are reached and paid, and the collected
  // Count goes back to none. The progress is read once the levels arrive, so Oculi collected meanwhile are offered too
  const offerStatueOculi = (landmarkId: string, source: Pick<WorldDrop, "id" | "position">) => {
    const regionId = getStatueRegionId(landmarkId);
    if (regionId === undefined) return;
    getResultAsync(() => readRegionStatueLevels(regionId)).match(
      (levels) => {
        const progress = getRegionProgress(regionId);
        const offered = offerCollectedOculi(toStatueRegionProgress(progress, levels), progress.collectedCount);
        gainWorldAdventureExp(payLevels(offered.gainedLevels, source));
        setRegionProgress(regionId, toStatueRegionProgressSave(offered.progress, 0));
      },
      (error) => {
        console.error(error);
      },
    );
  };
  return { collectOculus, getStatueProgress, offerStatueOculi, readStatueLevelsOf, resonateStatue };
};
