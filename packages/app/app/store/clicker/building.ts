import type { Building } from "#shared/models/clicker/data/building/Building";
import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { BuildingMap } from "@@/server/assets/clicker/data/BuildingMap";

import { formatNumberLong } from "@/services/clicker/format";
import { applyBuildingUpgrade } from "@/services/clicker/upgrade/applyBuildingUpgrade";
import { applyBuildingUpgrades } from "@/services/clicker/upgrade/applyBuildingUpgrades";
import { useClickerStore } from "@/store/clicker";
import { usePointStore } from "@/store/clicker/point";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { getInitials } from "@/util/text/getInitials";

export const useBuildingStore = defineStore("clicker/building", () => {
  const clickerStore = useClickerStore();
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;
  const clickerItemProperties = useClickerItemProperties();

  const buildingMap = ref<typeof BuildingMap>();
  const buildingList = computed<Building[]>(() => (buildingMap.value ? parseDictionaryToArray(buildingMap.value) : []));
  const initializeBuildingMap = (newBuildingMap: typeof BuildingMap) => {
    buildingMap.value = newBuildingMap;
  };

  const allBuildingPower = computed(() =>
    applyBuildingUpgrades(0, clickerStore.game.boughtUpgrades, clickerStore.game.boughtBuildings),
  );
  const getBoughtBuildingPower = (boughtBuilding: BuildingWithStats) =>
    applyBuildingUpgrade(boughtBuilding, clickerStore.game.boughtUpgrades, clickerStore.game.boughtBuildings);
  const getBoughtBuildingAmount = (building: Building) => {
    const boughtBuilding = clickerStore.game.boughtBuildings.find((b) => b.id === building.id);
    if (!boughtBuilding) return 0;
    return boughtBuilding.amount;
  };
  const getBoughtBuildingStats = (building: Building) => {
    const boughtBuilding = clickerStore.game.boughtBuildings.find((b) => b.id === building.id);
    if (!boughtBuilding) return [];

    const buildingPower = getBoughtBuildingPower(boughtBuilding);

    return [
      `- Each ${boughtBuilding.id} produces **${formatNumberLong(buildingPower / boughtBuilding.amount)} ${
        clickerItemProperties.value.pluralName
      }** per second`,
      `- ${boughtBuilding.amount} ${boughtBuilding.id}s producing **${formatNumberLong(buildingPower)} ${
        clickerItemProperties.value.pluralName
      }** per second (**${formatNumberLong((buildingPower / allBuildingPower.value) * 100)}%** of total ${getInitials(
        clickerItemProperties.value.pluralName,
      )}pS)`,
      `- **${formatNumberLong(boughtBuilding.producedValue, 3)}** ${clickerItemProperties.value.pluralName} produced so far`,
    ];
  };
  const getBuildingPrice = (building: Building) => {
    const boughtBuildingAmount = getBoughtBuildingAmount(building);
    return Math.trunc(building.basePrice * Math.pow(1.15, boughtBuildingAmount));
  };

  const createBoughtBuilding = (newBuilding: Building) => {
    const newBuildingPrice = getBuildingPrice(newBuilding);
    const boughtBuilding = clickerStore.game.boughtBuildings.find((b) => b.id === newBuilding.id);
    if (!boughtBuilding) {
      clickerStore.game.boughtBuildings.push({ ...newBuilding, amount: 1, producedValue: 0 });
      decrementPoints(newBuildingPrice);
      return;
    }

    boughtBuilding.amount++;
    decrementPoints(newBuildingPrice);
  };

  return {
    allBuildingPower,
    buildingList,
    createBoughtBuilding,
    getBoughtBuildingAmount,
    getBoughtBuildingPower,
    getBoughtBuildingStats,
    getBuildingPrice,
    initializeBuildingMap,
  };
});
