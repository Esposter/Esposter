import { applyMouseUpgrades } from "@/services/clicker/upgrade/applyMouseUpgrades";
import { useClickerStore } from "@/store/clicker";

export const useMouseStore = defineStore("clicker/mouse", () => {
  const clickerStore = useClickerStore();
  const { game } = storeToRefs(clickerStore);
  const mousePower = computed(() => applyMouseUpgrades(1, game.value.boughtUpgrades, game.value.boughtBuildings));
  return { mousePower };
});
