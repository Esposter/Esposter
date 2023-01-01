import type { Building, BuildingWithStats } from "@/models/clicker";
import { applyBuildingUpgrades, applyBuildingUpgradesSingle } from "@/services/clicker";
import { formatNumberLong } from "@/services/clicker/format";
import { useGameStore } from "@/store/clicker/useGameStore";
import { ITEM_NAME } from "@/util/constants.client";
import { getInitials } from "@/util/text";
import { defineStore } from "pinia";

export const useBuildingStore = defineStore("clicker/building", () => {
  const gameStore = useGameStore();
  const buildingList = ref<Building[]>([]);
  const initialiseBuildingList = (buildings: Building[]) => {
    buildingList.value = buildings;
  };

  const allBuildingPower = computed(() => {
    if (!gameStore.game) return 0;
    return applyBuildingUpgrades(0, gameStore.game.boughtUpgrades, gameStore.game.boughtBuildings);
  });
  const getBoughtBuildingPower = computed(() => (boughtBuilding: BuildingWithStats) => {
    if (!gameStore.game) return 0;
    return applyBuildingUpgradesSingle(boughtBuilding, gameStore.game.boughtUpgrades, gameStore.game.boughtBuildings);
  });
  const getBoughtBuildingLevel = computed(() => (building: Building) => {
    if (!gameStore.game) return 0;

    const boughtBuilding = gameStore.game.boughtBuildings.find((b) => b.name === building.name);
    if (!boughtBuilding) return 0;
    return boughtBuilding.level;
  });
  const getBoughtBuildingStats = computed(() => (building: Building) => {
    if (!gameStore.game) return [];

    const boughtBuilding = gameStore.game.boughtBuildings.find((b) => b.name === building.name);
    if (!boughtBuilding) return [];

    const buildingPower = getBoughtBuildingPower.value(boughtBuilding);

    return [
      `Each ${boughtBuilding.name} produces **${formatNumberLong(
        buildingPower / boughtBuilding.level
      )} ${ITEM_NAME}s** per second`,
      `${boughtBuilding.level} ${boughtBuilding.name}s producing **${formatNumberLong(
        buildingPower
      )} ${ITEM_NAME}s** per second (**${(buildingPower / allBuildingPower.value) * 100}%** of total ${getInitials(
        ITEM_NAME
      )}pS)`,
      `**${formatNumberLong(boughtBuilding.producedValue)}** ${ITEM_NAME}s produced so far`,
    ];
  });
  const getBuildingPrice = computed(() => (building: Building) => {
    const boughtBuildingLevel = getBoughtBuildingLevel.value(building);
    return Math.trunc(building.basePrice * Math.pow(1.15, boughtBuildingLevel));
  });

  const createBoughtBuilding = (newBuilding: Building) => {
    if (!gameStore.game) return;

    const newBuildingPrice = getBuildingPrice.value(newBuilding);
    const boughtBuilding = gameStore.game.boughtBuildings.find((b) => b.name === newBuilding.name);
    if (!boughtBuilding) {
      gameStore.game.boughtBuildings.push({ ...newBuilding, level: 1, producedValue: 0 });
      gameStore.game.noPoints -= newBuildingPrice;
      return;
    }

    boughtBuilding.level++;
    gameStore.game.noPoints -= newBuildingPrice;
  };

  return {
    buildingList,
    initialiseBuildingList,
    allBuildingPower,
    getBoughtBuildingPower,
    getBoughtBuildingLevel,
    getBuildingPrice,
    getBoughtBuildingStats,
    createBoughtBuilding,
  };
});
