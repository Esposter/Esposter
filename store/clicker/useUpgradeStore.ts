import type { Upgrade } from "@/models/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { defineStore } from "pinia";

export const useUpgradeStore = defineStore("clicker/upgrade", () => {
  const gameStore = useGameStore();
  const upgradeList = ref<Upgrade[]>([]);
  const initialiseUpgradeList = (upgrades: Upgrade[]) => {
    upgradeList.value = upgrades;
  };

  const createBoughtUpgrade = (newUpgrade: Upgrade) => {
    if (!gameStore.game) return;
    gameStore.game.boughtUpgrades.push(newUpgrade);
    gameStore.game.noPoints -= newUpgrade.price;
  };
  return { upgradeList, initialiseUpgradeList, createBoughtUpgrade };
});
