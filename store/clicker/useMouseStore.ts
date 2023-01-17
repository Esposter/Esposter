import { applyMouseUpgrades } from "@/services/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";

export const useMouseStore = defineStore("clicker/mouse", () => {
  const gameStore = useGameStore();
  const mousePower = computed(() =>
    applyMouseUpgrades(1, gameStore.game.boughtUpgrades, gameStore.game.boughtBuildings)
  );
  return { mousePower };
});
