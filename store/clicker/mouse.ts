import { applyMouseUpgrades } from "@/services/clicker/upgrade";
import { useGameStore } from "@/store/clicker/game";

export const useMouseStore = defineStore("clicker/mouse", () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);

  const mousePower = computed(() =>
    game.value ? applyMouseUpgrades(1, game.value.boughtUpgrades, game.value.boughtBuildings) : 1
  );
  return { mousePower };
});
