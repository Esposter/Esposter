import type { Building } from "@/models/clicker/Building";
import type { BuildingWithStats } from "@/models/clicker/BuildingWithStats";
import { ITEM_NAME } from "@/services/clicker/constants";
import { formatNumberLong } from "@/services/clicker/format";
import { applyBuildingUpgrades, applyBuildingUpgradesSingle } from "@/services/clicker/upgrade";
import { useGameStore } from "@/store/clicker/game";
import { usePointStore } from "@/store/clicker/point";
import { getInitials } from "@/util/text";

export const useBuildingStore = defineStore("clicker/building", () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;

  const buildingList = ref<Building[]>([]);
  const initialiseBuildingList = (buildings: Building[]) => {
    buildingList.value = buildings;
  };

  const allBuildingPower = computed(() =>
    game.value ? applyBuildingUpgrades(0, game.value.boughtUpgrades, game.value.boughtBuildings) : 0,
  );
  const getBoughtBuildingPower = (boughtBuilding: BuildingWithStats) =>
    game.value ? applyBuildingUpgradesSingle(boughtBuilding, game.value.boughtUpgrades, game.value.boughtBuildings) : 0;
  const getBoughtBuildingAmount = (building: Building) => {
    const boughtBuilding = game.value.boughtBuildings.find((b) => b.name === building.name);
    if (!boughtBuilding) return 0;
    return boughtBuilding.amount;
  };
  const getBoughtBuildingStats = (building: Building) => {
    const boughtBuilding = game.value.boughtBuildings.find((b) => b.name === building.name);
    if (!boughtBuilding) return [];

    const buildingPower = getBoughtBuildingPower(boughtBuilding);

    return [
      `Each ${boughtBuilding.name} produces **${formatNumberLong(
        buildingPower / boughtBuilding.amount,
      )} ${ITEM_NAME}s** per second`,
      `${boughtBuilding.amount} ${boughtBuilding.name}s producing **${formatNumberLong(
        buildingPower,
      )} ${ITEM_NAME}s** per second (**${formatNumberLong(
        (buildingPower / allBuildingPower.value) * 100,
      )}%** of total ${getInitials(ITEM_NAME)}pS)`,
      `**${formatNumberLong(boughtBuilding.producedValue)}** ${ITEM_NAME}s produced so far`,
    ];
  };
  const getBuildingPrice = (building: Building) => {
    const boughtBuildingAmount = getBoughtBuildingAmount(building);
    return Math.trunc(building.basePrice * Math.pow(1.15, boughtBuildingAmount));
  };

  const createBoughtBuilding = (newBuilding: Building) => {
    const newBuildingPrice = getBuildingPrice(newBuilding);
    const boughtBuilding = game.value.boughtBuildings.find((b) => b.name === newBuilding.name);
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
    initialiseBuildingList,
    allBuildingPower,
    getBoughtBuildingPower,
    getBoughtBuildingAmount,
    getBoughtBuildingStats,
    getBuildingPrice,
    createBoughtBuilding,
  };
});
