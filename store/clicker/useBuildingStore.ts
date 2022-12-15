import type { Building } from "@/models/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { defineStore } from "pinia";

export const useBuildingStore = defineStore("clicker/building", () => {
  const gameStore = useGameStore();
  const buildingList = ref<Building[]>([]);
  const initialiseBuildingList = (buildings: Building[]) => {
    buildingList.value = buildings;
  };

  const createBoughtBuilding = (newBuilding: Building) => {
    if (!gameStore.game) return;

    const newBuildingPrice = getBuildingPrice(newBuilding);
    const foundBuilding = gameStore.game.boughtBuildingList.find((b) => b.name === newBuilding.name);
    if (!foundBuilding) {
      gameStore.game.boughtBuildingList.push(newBuilding);
      gameStore.game.noPoints -= newBuildingPrice;
      gameStore.saveGame();
      return;
    }

    foundBuilding.level++;
    gameStore.game.noPoints -= newBuildingPrice;
    gameStore.saveGame();
  };

  const getBuildingPrice = (building: Building) => Math.pow(building.basePrice, building.level);

  return { buildingList, initialiseBuildingList, createBoughtBuilding, getBuildingPrice };
});
