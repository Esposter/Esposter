import { UpgradeTarget, UpgradeType } from "@/models/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { defineStore } from "pinia";

export const useMouseStore = defineStore("clicker/mouse", () => {
  const gameStore = useGameStore();
  const baseMousePower = ref(1);
  const mousePower = computed(() => {
    if (!gameStore.game) return 0;
    let resultPower = baseMousePower.value;
    const mouseUpgrades = gameStore.game.boughtUpgradeList.filter((u) =>
      u.upgradeTargets.includes(UpgradeTarget.Mouse)
    );

    const additiveUpgrades = mouseUpgrades.filter((cu) => cu.upgradeType === UpgradeType.Additive);
    for (const additiveUpgrade of additiveUpgrades) resultPower += additiveUpgrade.value;

    const multiplicativeUpgrades = mouseUpgrades.filter((cu) => cu.upgradeType === UpgradeType.Multiplicative);
    for (const multiplicativeUpgrade of multiplicativeUpgrades) resultPower *= multiplicativeUpgrade.value;

    return resultPower;
  });
  return { mousePower };
});
