import type { Building, BuildingWithStats } from "@/models/clicker";
import { applyBuildingUpgrades, applyBuildingUpgradesSingle } from "@/services/clicker";
import { formatNumberLong } from "@/services/clicker/format";
import { useGameStore } from "@/store/clicker/useGameStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { ITEM_NAME } from "@/util/constants.client";
import { getInitials } from "@/util/text";

export const useBuildingStore = defineStore("clicker/building", () => {
  const gameStore = useGameStore();
  const pointStore = usePointStore();
  const buildingList = ref<Building[]>([]);
  const initialiseBuildingList = (buildings: Building[]) => {
    buildingList.value = buildings;
  };

  const allBuildingPower = computed(() =>
    applyBuildingUpgrades(0, gameStore.game.boughtUpgrades, gameStore.game.boughtBuildings)
  );
  const getBoughtBuildingPower = computed(
    () => (boughtBuilding: BuildingWithStats) =>
      applyBuildingUpgradesSingle(boughtBuilding, gameStore.game.boughtUpgrades, gameStore.game.boughtBuildings)
  );
  const getBoughtBuildingAmount = computed(() => (building: Building) => {
    const boughtBuilding = gameStore.game.boughtBuildings.find((b) => b.name === building.name);
    if (!boughtBuilding) return 0;
    return boughtBuilding.amount;
  });
  const getBoughtBuildingStats = computed(() => (building: Building) => {
    const boughtBuilding = gameStore.game.boughtBuildings.find((b) => b.name === building.name);
    if (!boughtBuilding) return [];

    const buildingPower = getBoughtBuildingPower.value(boughtBuilding);

    return [
      `Each ${boughtBuilding.name} produces **${formatNumberLong(
        buildingPower / boughtBuilding.amount
      )} ${ITEM_NAME}s** per second`,
      `${boughtBuilding.amount} ${boughtBuilding.name}s producing **${formatNumberLong(
        buildingPower
      )} ${ITEM_NAME}s** per second (**${formatNumberLong(
        (buildingPower / allBuildingPower.value) * 100
      )}%** of total ${getInitials(ITEM_NAME)}pS)`,
      `**${formatNumberLong(boughtBuilding.producedValue)}** ${ITEM_NAME}s produced so far`,
    ];
  });
  const getBuildingPrice = computed(() => (building: Building) => {
    const boughtBuildingAmount = getBoughtBuildingAmount.value(building);
    return Math.trunc(building.basePrice * Math.pow(1.15, boughtBuildingAmount));
  });

  const createBoughtBuilding = (newBuilding: Building) => {
    const newBuildingPrice = getBuildingPrice.value(newBuilding);
    const boughtBuilding = gameStore.game.boughtBuildings.find((b) => b.name === newBuilding.name);
    if (!boughtBuilding) {
      gameStore.game.boughtBuildings.push({ ...newBuilding, amount: 1, producedValue: 0 });
      pointStore.decrementPoints(newBuildingPrice);
      return;
    }

    boughtBuilding.amount++;
    pointStore.decrementPoints(newBuildingPrice);
  };

  return {
    buildingList,
    initialiseBuildingList,
    allBuildingPower,
    getBoughtBuildingPower,
    getBoughtBuildingAmount,
    getBoughtBuildingStats,
    getBuildingPrice,
    createBoughtBuilding,
  };
});
