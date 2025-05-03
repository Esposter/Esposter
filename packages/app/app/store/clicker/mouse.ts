import { applyMouseUpgrades } from "@/services/clicker/upgrade/applyMouseUpgrades";
import { useClickerStore } from "@/store/clicker";

export const useMouseStore = defineStore("clicker/mouse", () => {
  const clickerStore = useClickerStore();
  const mousePower = computed(() =>
    applyMouseUpgrades(1, clickerStore.clicker.boughtUpgrades, clickerStore.clicker.boughtBuildings),
  );
  return { mousePower };
});
