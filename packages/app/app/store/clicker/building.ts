import type { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import type { Building } from "#shared/models/clicker/data/building/Building";
import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";

import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { formatNumberLong } from "@/services/clicker/format";
import { applyBuildingUpgrade } from "@/services/clicker/upgrade/applyBuildingUpgrade";
import { applyBuildingUpgrades } from "@/services/clicker/upgrade/applyBuildingUpgrades";
import { useClickerStore } from "@/store/clicker";
import { usePointStore } from "@/store/clicker/point";
import { getInitials } from "@/util/text/getInitials";

export const useBuildingStore = defineStore("clicker/building", () => {
  const clickerStore = useClickerStore();
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;
  const clickerItemProperties = useClickerItemProperties();

  const buildingMap = ref<typeof BuildingMap>();
  const buildings = computed<Building[]>(() => (buildingMap.value ? parseDictionaryToArray(buildingMap.value) : []));
  const initializeBuildingMap = (newBuildingMap: typeof BuildingMap) => {
    buildingMap.value = newBuildingMap;
  };

  const allBuildingPower = computed(() =>
    applyBuildingUpgrades(0, clickerStore.clicker.boughtUpgrades, clickerStore.clicker.boughtBuildings),
  );
  const getBoughtBuildingPower = (boughtBuilding: BuildingWithStats) =>
    applyBuildingUpgrade(boughtBuilding, clickerStore.clicker.boughtUpgrades, clickerStore.clicker.boughtBuildings);
  const getBoughtBuildingAmount = (building: Building) => {
    const boughtBuilding = clickerStore.clicker.boughtBuildings.find(({ id }) => id === building.id);
    if (!boughtBuilding) return 0;
    return boughtBuilding.amount;
  };
  const getBoughtBuildingStats = (building: Building) => {
    const boughtBuilding = clickerStore.clicker.boughtBuildings.find(({ id }) => id === building.id);
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
    return Math.trunc(building.basePrice * (1 + boughtBuildingAmount) ** 1.15);
  };

  const createBoughtBuilding = (newBuilding: Building) => {
    const newBuildingPrice = getBuildingPrice(newBuilding);
    const boughtBuilding = clickerStore.clicker.boughtBuildings.find(({ id }) => id === newBuilding.id);
    if (!boughtBuilding) {
      clickerStore.clicker.boughtBuildings.push({ ...newBuilding, amount: 1, producedValue: 0 });
      decrementPoints(newBuildingPrice);
      return;
    }

    boughtBuilding.amount++;
    decrementPoints(newBuildingPrice);
  };

  return {
    allBuildingPower,
    buildings,
    createBoughtBuilding,
    getBoughtBuildingAmount,
    getBoughtBuildingPower,
    getBoughtBuildingStats,
    getBuildingPrice,
    initializeBuildingMap,
  };
});
