import type { UpgradeMap } from "@/server/assets/clicker/data/upgrades/UpgradeMap";
import type { Upgrade } from "@/shared/models/clicker/data/upgrade/Upgrade";

import { Target } from "@/shared/models/clicker/data/Target";
import { useClickerStore } from "@/store/clicker";
import { usePointStore } from "@/store/clicker/point";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { exhaustiveGuard } from "@esposter/shared";

export const useUpgradeStore = defineStore("clicker/upgrade", () => {
  const clickerStore = useClickerStore();
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;
  const upgradeMap = ref<typeof UpgradeMap>();
  const upgradeList = computed<Upgrade[]>(() => (upgradeMap.value ? parseDictionaryToArray(upgradeMap.value) : []));
  const initializeUpgradeMap = (newUpgradeMap: typeof UpgradeMap) => {
    upgradeMap.value = newUpgradeMap;
  };
  const unlockedUpgrades = computed<Upgrade[]>(() =>
    upgradeList.value.filter((u) =>
      u.unlockConditions.every((uc) => {
        const { type } = uc;

        switch (type) {
          case Target.Building: {
            const foundBuilding = clickerStore.game.boughtBuildings.find((bb) => bb.id === uc.id);
            if (foundBuilding) return foundBuilding.amount >= uc.amount;
            break;
          }
          case Target.Upgrade: {
            const foundUpgrade = clickerStore.game.boughtUpgrades.find((bu) => bu.id === uc.id);
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
    clickerStore.game.boughtUpgrades.push(newUpgrade);
    decrementPoints(newUpgrade.price);
  };

  return {
    createBoughtUpgrade,
    initializeUpgradeMap,
    unlockedUpgrades,
    upgradeList,
  };
});
