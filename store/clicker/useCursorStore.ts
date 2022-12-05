import { useGameStore } from "@/store/clicker/useGameStore";
import { defineStore } from "pinia";

export const useCursorStore = defineStore("clicker/cursor", () => {
  const gameStore = useGameStore();
  const baseCursorPower = ref(1);
  const cursorPower = computed(() => {
    let resultPower = baseCursorPower.value;

    if (!gameStore.game) return resultPower;
    const multiplicativeUpgrades = gameStore.game.boughtUpgradeList ?? [];
    for (const multiplicativeUpgrade of multiplicativeUpgrades) resultPower *= multiplicativeUpgrade.value;
    return resultPower;
  });
  return { cursorPower };
});
