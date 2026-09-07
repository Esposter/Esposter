import type { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import type { Building } from "#shared/models/clicker/data/building/Building";
import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";

import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { getBuildingPrice as baseGetBuildingPrice } from "@/services/clicker/building/getBuildingPrice";
import { formatNumberLong } from "@/services/clicker/formatNumberLong";
import { applyBuildingUpgrade } from "@/services/clicker/upgrade/applyBuildingUpgrade";
import { applyBuildingUpgrades } from "@/services/clicker/upgrade/applyBuildingUpgrades";
import { useClickerStore } from "@/store/clicker";
import { usePointStore } from "@/store/clicker/point";
import { getInitials } from "@/util/text/getInitials";

export const useBuildingStore = defineStore("clicker/building", () => {
  const clickerStore = useClickerStore();
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;

  const buildingMap = ref<typeof BuildingMap>();
  const buildings = computed<Building[]>(() => (buildingMap.value ? parseDictionaryToArray(buildingMap.value) : []));
  const initializeBuildingMap = (newBuildingMap: typeof BuildingMap) => {
    buildingMap.value = newBuildingMap;
  };

  const allBuildingPower = computed(() =>
    applyBuildingUpgrades(0, clickerStore.clicker.boughtUpgrades, clickerStore.clicker.boughtBuildings),
  );
  const getBoughtBuildingPower = (boughtBuilding: BuildingWithStatistics) =>
    applyBuildingUpgrade(boughtBuilding, clickerStore.clicker.boughtUpgrades, clickerStore.clicker.boughtBuildings);
  const getBoughtBuilding = (building: Building) =>
    clickerStore.clicker.boughtBuildings.find(({ id }) => id === building.id);
  const getBoughtBuildingAmount = (building: Building) => {
    const boughtBuilding = getBoughtBuilding(building);
    if (!boughtBuilding) return 0;
    return boughtBuilding.amount;
  };
  const getBoughtBuildingStatistics = (building: Building) => {
    const boughtBuilding = getBoughtBuilding(building);
    if (!boughtBuilding) return [];

    const buildingPower = getBoughtBuildingPower(boughtBuilding);
    return [
      `- Each ${boughtBuilding.id} produces **${formatNumberLong(buildingPower / boughtBuilding.amount)} ${
        clickerStore.clickerItemProperties.pluralName
      }** per second`,
      `- ${boughtBuilding.amount} ${boughtBuilding.id}s producing **${formatNumberLong(buildingPower)} ${
        clickerStore.clickerItemProperties.pluralName
      }** per second (**${formatNumberLong((buildingPower / allBuildingPower.value) * 100)}%** of total ${getInitials(
        clickerStore.clickerItemProperties.pluralName,
      )}pS)`,
      `- **${formatNumberLong(boughtBuilding.producedValue, 3)}** ${clickerStore.clickerItemProperties.pluralName} produced so far`,
    ];
  };
  // Summing the per-unit prices over the loop stays exact under any price formula.
  const getBuildingPriceForQuantity = (building: Building, quantity: number) => {
    const boughtBuildingAmount = getBoughtBuildingAmount(building);
    let priceForQuantity = 0;
    for (let index = 0; index < quantity; index++)
      priceForQuantity += baseGetBuildingPrice(building, boughtBuildingAmount + index);
    return priceForQuantity;
  };

  const buyQuantity = ref(1);
  const createBoughtBuilding = (newBuilding: Building, quantity: number) => {
    const newBuildingPrice = getBuildingPriceForQuantity(newBuilding, quantity);
    const boughtBuilding = getBoughtBuilding(newBuilding);
    if (boughtBuilding) boughtBuilding.amount += quantity;
    else clickerStore.clicker.boughtBuildings.push({ ...newBuilding, amount: quantity, producedValue: 0 });
    decrementPoints(newBuildingPrice);
  };

  return {
    allBuildingPower,
    buildings,
    buyQuantity,
    createBoughtBuilding,
    getBoughtBuildingAmount,
    getBoughtBuildingPower,
    getBoughtBuildingStatistics,
    getBuildingPriceForQuantity,
    initializeBuildingMap,
  };
});
