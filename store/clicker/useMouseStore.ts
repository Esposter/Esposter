import { applyMouseUpgrades } from "@/services/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { defineStore } from "pinia";

export const useMouseStore = defineStore("clicker/mouse", () => {
  const gameStore = useGameStore();
  const mousePower = computed(() =>
    applyMouseUpgrades(1, gameStore.game.boughtUpgrades, gameStore.game.boughtBuildings)
  );
  return { mousePower };
});
