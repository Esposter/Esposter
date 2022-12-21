import { UpgradeTarget } from "@/models/clicker";
import { applyUpgrades } from "@/services/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { defineStore } from "pinia";

export const useMouseStore = defineStore("clicker/mouse", () => {
  const gameStore = useGameStore();
  const mousePower = computed(() => {
    if (!gameStore.game) return 0;
    let resultPower = 1;
    const mouseUpgrades = gameStore.game.boughtUpgrades.filter((u) => u.upgradeTargets.includes(UpgradeTarget.Mouse));
    resultPower = applyUpgrades(resultPower, mouseUpgrades);
    return resultPower;
  });
  return { mousePower };
});
