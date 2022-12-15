import { Building, UpgradeTarget, UpgradeType } from "@/models/clicker";
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
    let resultPower = 0;

    for (const building of gameStore.game.boughtBuildingList) resultPower += building.baseValue * building.level;

    const buildingUpgrades = gameStore.game.boughtUpgradeList.filter((u) =>
      u.upgradeTargets.includes(UpgradeTarget.Building)
    );

    const additiveUpgrades = buildingUpgrades.filter((cu) => cu.upgradeType === UpgradeType.Additive);
    for (const additiveUpgrade of additiveUpgrades) resultPower += additiveUpgrade.value;

    const multiplicativeUpgrades = buildingUpgrades.filter((cu) => cu.upgradeType === UpgradeType.Multiplicative);
    for (const multiplicativeUpgrade of multiplicativeUpgrades) resultPower *= multiplicativeUpgrade.value;

    return resultPower;
  });
  const getBoughtBuildingLevel = computed(() => (building: Building) => {
    if (!gameStore.game) return 0;

    const foundBuilding = gameStore.game.boughtBuildingList.find((b) => b.name === building.name);
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

  return {
    buildingList,
    initialiseBuildingList,
    buildingPower,
    getBoughtBuildingLevel,
    getBuildingPrice,
    createBoughtBuilding,
  };
});
