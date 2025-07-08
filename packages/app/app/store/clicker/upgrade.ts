import type { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { Target } from "#shared/models/clicker/data/Target";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { useClickerStore } from "@/store/clicker";
import { usePointStore } from "@/store/clicker/point";
import { exhaustiveGuard } from "@esposter/shared";

export const useUpgradeStore = defineStore("clicker/upgrade", () => {
  const clickerStore = useClickerStore();
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;
  const upgradeMap = ref<typeof UpgradeMap>();
  const upgrades = computed<Upgrade[]>(() => (upgradeMap.value ? parseDictionaryToArray(upgradeMap.value) : []));
  const initializeUpgradeMap = (newUpgradeMap: typeof UpgradeMap) => {
    upgradeMap.value = newUpgradeMap;
  };
  const unlockedUpgrades = computed<Upgrade[]>(() =>
    upgrades.value.filter(({ unlockConditions }) =>
      unlockConditions.every((uc) => {
        const { type } = uc;

        switch (type) {
          case Target.Building: {
            const foundBuilding = clickerStore.clicker.boughtBuildings.find(({ id }) => id === uc.id);
            if (foundBuilding) return foundBuilding.amount >= uc.amount;
            break;
          }
          case Target.Upgrade: {
            const foundUpgrade = clickerStore.clicker.boughtUpgrades.find(({ id }) => id === uc.id);
            if (foundUpgrade) return true;
            break;
          }
          default:
            exhaustiveGuard(type);
        }

        return false;
      }),
    ),
  );

  const createBoughtUpgrade = (newUpgrade: Upgrade) => {
    clickerStore.clicker.boughtUpgrades.push(newUpgrade);
    decrementPoints(newUpgrade.price);
  };

  return {
    createBoughtUpgrade,
    initializeUpgradeMap,
    unlockedUpgrades,
    upgrades,
  };
});
