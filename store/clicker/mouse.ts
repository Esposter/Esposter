import { applyMouseUpgrades } from "@/services/clicker/upgrade";
import { useGameStore } from "@/store/clicker/game";

export const useMouseStore = defineStore("clicker/mouse", () => {
  const gameStore = useGameStore();
  const { game } = $(storeToRefs(gameStore));

  const mousePower = computed(() => applyMouseUpgrades(1, game.boughtUpgrades, game.boughtBuildings));
  return { mousePower };
});
