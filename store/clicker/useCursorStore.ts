import { UpgradeTarget, UpgradeType } from "@/models/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { defineStore } from "pinia";

export const useCursorStore = defineStore("clicker/cursor", () => {
  const gameStore = useGameStore();
  const baseCursorPower = ref(1);
  const cursorPower = computed(() => {
    if (!gameStore.game) return 0;
    let resultPower = baseCursorPower.value;
    const cursorUpgrades = gameStore.game.boughtUpgradeList.filter((u) =>
      u.upgradeTargets.includes(UpgradeTarget.Cursor)
    );

    const additiveUpgrades = cursorUpgrades.filter((cu) => cu.upgradeType === UpgradeType.Additive);
    for (const additiveUpgrade of additiveUpgrades) resultPower += additiveUpgrade.value;

    const multiplicativeUpgrades = cursorUpgrades.filter((cu) => cu.upgradeType === UpgradeType.Multiplicative);
    for (const multiplicativeUpgrade of multiplicativeUpgrades) resultPower *= multiplicativeUpgrade.value;

    return resultPower;
  });
  return { cursorPower };
});
