import type { Upgrade } from "@/models/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { defineStore } from "pinia";

export const useUpgradeStore = defineStore("clicker/upgrade", () => {
  const gameStore = useGameStore();
  const pointStore = usePointStore();
  const upgradeList = ref<Upgrade[]>([]);
  const initialiseUpgradeList = (upgrades: Upgrade[]) => {
    upgradeList.value = upgrades;
  };

  const unlockedUpgrades = computed<Upgrade[]>(() =>
    upgradeList.value.filter((u) =>
      u.unlockConditions.every((uc) => {
        for (const boughtBuilding of gameStore.game.boughtBuildings)
          if (boughtBuilding.name === uc.target) return boughtBuilding.amount >= uc.amount;

        for (const boughtUpgrade of gameStore.game.boughtUpgrades) if (boughtUpgrade.name === uc.target) return true;

        return false;
      })
    )
  );

  const createBoughtUpgrade = (newUpgrade: Upgrade) => {
    gameStore.game.boughtUpgrades.push(newUpgrade);
    pointStore.decrementPoints(newUpgrade.price);
  };
  return { upgradeList, initialiseUpgradeList, unlockedUpgrades, createBoughtUpgrade };
});
