import type { BuildingMap } from "@/assets/clicker/data/BuildingMap";
import type { Building } from "@/models/clicker/data/building/Building";
import type { BuildingWithStats } from "@/models/clicker/data/building/BuildingWithStats";
import { formatNumberLong } from "@/services/clicker/format";
import { applyBuildingUpgrade } from "@/services/clicker/upgrade/applyBuildingUpgrade";
import { applyBuildingUpgrades } from "@/services/clicker/upgrade/applyBuildingUpgrades";
import { useClickerStore } from "@/store/clicker";
import { usePointStore } from "@/store/clicker/point";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { getInitials } from "@/util/text/getInitials";

export const useBuildingStore = defineStore("clicker/building", () => {
  const clickerStore = useClickerStore();
  const { game } = storeToRefs(clickerStore);
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;
  const clickerItemProperties = useClickerItemProperties();

  const buildingMap = ref<typeof BuildingMap>();
  const buildingList = computed<Building[]>(() => (buildingMap.value ? parseDictionaryToArray(buildingMap.value) : []));
  const initializeBuildingMap = (newBuildingMap: typeof BuildingMap) => {
    buildingMap.value = newBuildingMap;
  };

  const allBuildingPower = computed(() =>
    applyBuildingUpgrades(0, game.value.boughtUpgrades, game.value.boughtBuildings),
  );
  const getBoughtBuildingPower = (boughtBuilding: BuildingWithStats) =>
    applyBuildingUpgrade(boughtBuilding, game.value.boughtUpgrades, game.value.boughtBuildings);
  const getBoughtBuildingAmount = (building: Building) => {
    const boughtBuilding = game.value.boughtBuildings.find((b) => b.id === building.id);
    if (!boughtBuilding) return 0;
    return boughtBuilding.amount;
  };
  const getBoughtBuildingStats = (building: Building) => {
    const boughtBuilding = game.value.boughtBuildings.find((b) => b.id === building.id);
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
    const boughtBuilding = game.value.boughtBuildings.find((b) => b.id === newBuilding.id);
    if (!boughtBuilding) {
      game.value.boughtBuildings.push({ ...newBuilding, amount: 1, producedValue: 0 });
      decrementPoints(newBuildingPrice);
      return;
    }

    boughtBuilding.amount++;
    decrementPoints(newBuildingPrice);
  };

  return {
    buildingList,
    initializeBuildingMap,
    allBuildingPower,
    getBoughtBuildingPower,
    getBoughtBuildingAmount,
    getBoughtBuildingStats,
    getBuildingPrice,
    createBoughtBuilding,
  };
});
