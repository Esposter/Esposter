import type { Building } from "@/models/clicker";
import { applyBuildings, applyUpgrades } from "@/services/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { defineStore } from "pinia";

export const useBuildingStore = defineStore("clicker/building", () => {
  const gameStore = useGameStore();
  const buildingList = ref<Building[]>([]);
  const initialiseBuildingList = (buildings: Building[]) => {
    buildingList.value = buildings;
  };

  const buildingPower = computed(() => {
    if (!gameStore.game) return 0;
    const game = gameStore.game;

    let resultPower = applyBuildings(0, game.boughtBuildings);
    const buildingUpgrades = game.boughtUpgrades.filter((u) =>
      game.boughtBuildings.some((b) => u.upgradeTargets.includes(b.name))
    );
    resultPower = applyUpgrades(resultPower, buildingUpgrades, game.boughtBuildings);
    return resultPower;
  });
  const getBoughtBuildingLevel = computed(() => (building: Building) => {
    if (!gameStore.game) return 0;

    const foundBuilding = gameStore.game.boughtBuildings.find((b) => b.name === building.name);
    if (!foundBuilding) return 0;
    return foundBuilding.level;
  });
  const getBuildingPrice = computed(() => (building: Building) => {
    const boughtBuildingLevel = getBoughtBuildingLevel.value(building);
    return Math.trunc(building.basePrice * Math.pow(1.15, boughtBuildingLevel));
  });

  const createBoughtBuilding = (newBuilding: Building) => {
    if (!gameStore.game) return;

    const newBuildingPrice = getBuildingPrice.value(newBuilding);
    const foundBuilding = gameStore.game.boughtBuildings.find((b) => b.name === newBuilding.name);
    if (!foundBuilding) {
      gameStore.game.boughtBuildings.push(newBuilding);
      gameStore.game.noPoints -= newBuildingPrice;
      gameStore.saveGame();
      return;
    }

    foundBuilding.level++;
    gameStore.game.noPoints -= newBuildingPrice;
    gameStore.saveGame();
  };

  return {
    buildingList,
    initialiseBuildingList,
    buildingPower,
    getBoughtBuildingLevel,
    getBuildingPrice,
    createBoughtBuilding,
  };
});
