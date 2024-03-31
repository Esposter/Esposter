import type { Upgrade } from "@/models/clicker/data/Upgrade";
import type { BuildingUnlockCondition } from "@/models/clicker/data/unlockCondition/BuildingUnlockCondition";
import { useGameStore } from "@/store/clicker/game";
import { usePointStore } from "@/store/clicker/point";

export const useUpgradeStore = defineStore("clicker/upgrade", () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;

  const upgradeList = ref<Upgrade[]>([]);
  const initializeUpgradeList = (upgrades: Upgrade[]) => {
    upgradeList.value = upgrades;
  };
  const unlockedUpgrades = computed<Upgrade[]>(() =>
    upgradeList.value.filter((u) =>
      u.unlockConditions.every((uc) => {
        const foundBuilding = game.value.boughtBuildings.find((bb) => bb.name === uc.target);
        if (foundBuilding) return foundBuilding.amount >= (uc as BuildingUnlockCondition).amount;

        const foundUpgrade = game.value.boughtUpgrades.find((bu) => bu.name === uc.target);
        if (foundUpgrade) return true;

        return false;
      }),
    ),
  );

  const createBoughtUpgrade = (newUpgrade: Upgrade) => {
    game.value.boughtUpgrades.push(newUpgrade);
    decrementPoints(newUpgrade.price);
  };

  return {
    upgradeList,
    initializeUpgradeList,
    unlockedUpgrades,
    createBoughtUpgrade,
  };
});
