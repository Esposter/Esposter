import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref, ShallowRef } from "vue";

import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { payOfferingLevels } from "#src/services/offering/payOfferingLevels";
import { computeStatueLevelEvents } from "#src/services/statue/computeStatueLevelEvents";
import { findOculus } from "#src/services/statue/findOculus";
import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";
import { readStatueLevels } from "#src/services/statue/readStatueLevels";
import { resonateRegion } from "#src/services/statue/resonateRegion";
import { toStatueRegionProgress, toStatueRegionProgressSave } from "#src/services/statue/statueRegionProgress";
import { getResultAsync } from "@esposter/shared";

// The statues' state the world holds: each region's level and held count, and the Oculi found. A touch collects an Oculus
// And a resonance starts its region, each paying the levels it reaches and their rewards as a bag offer does. What the bag
// Has no room for drops where the touch or the resonance was made
export const useWorldStatues = ({
  events,
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
  events: WorldEvents;
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
  // The levels of the region's statues are read from the game's table as a statue is touched or resonated with, and the
  // Region's progress is kept as the save holds it, its levels left to the table
  // A level the region rises to is an achievement event for its city, read against the level the region held before it
  const setRegionProgress = (regionId: string, progress: StatueRegionProgressSave) => {
    const achievementEvents = computeStatueLevelEvents(regionId, getRegionProgress(regionId).level, progress.level);
    if (achievementEvents.length > 0) events.emit("achievementEvents", achievementEvents);
    regionStatueProgressMap.value = new Map([...regionStatueProgressMap.value, [regionId, progress]]);
  };
  // A region's progress as the save holds it, which a region no save holds yet starts from at none
  const getRegionProgress = (regionId: string): StatueRegionProgressSave =>
    regionStatueProgressMap.value.get(regionId) ?? { heldCount: 0, level: 0 };
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
  // Touching an Oculus collects it once: its Adventure EXP and the levels it completes are paid
  // A touch that lands while an Oculus's levels are still arriving waits for them, rather than reading them again
  const collectingOculusIds = new Set<string>();
  const collectOculus = (regionId: string, source: Pick<WorldDrop, "id" | "position">) => {
    if (collectingOculusIds.has(source.id)) return;
    collectingOculusIds.add(source.id);
    getResultAsync(() => readRegionStatueLevels(regionId)).match(
      (levels) => {
        collectingOculusIds.delete(source.id);
        const progress = getRegionProgress(regionId);
        const isNewlyFound = !foundOculusIds.value.has(source.id);
        const found = findOculus(foundOculusIds.value, source.id, toStatueRegionProgress(progress, levels));
        foundOculusIds.value = found.foundOculusIds;
        if (isNewlyFound && found.foundOculusIds.has(source.id)) events.emit("oculusFound");
        gainWorldAdventureExp(found.adventureExp + payLevels(found.gainedLevels, source));
        setRegionProgress(regionId, toStatueRegionProgressSave(found.progress));
      },
      (error) => {
        collectingOculusIds.delete(source.id);
        console.error(error);
      },
    );
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
        setRegionProgress(regionId, toStatueRegionProgressSave(resonated.progress));
      },
      (error) => {
        console.error(error);
      },
    );
  };
  return { collectOculus, resonateStatue };
};
