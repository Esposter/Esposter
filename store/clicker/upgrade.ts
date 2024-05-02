import type { UpgradeMap } from "@/assets/clicker/data/upgrades/UpgradeMap";
import { Target } from "@/models/clicker/data/Target";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";
import { useGameStore } from "@/store/clicker/game";
import { usePointStore } from "@/store/clicker/point";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";

export const useUpgradeStore = defineStore("clicker/upgrade", () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
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
          case Target.Upgrade: {
            const foundUpgrade = game.value.boughtUpgrades.find((bu) => bu.id === uc.id);
            if (foundUpgrade) return true;
            break;
          }
          case Target.Building: {
            const foundBuilding = game.value.boughtBuildings.find((bb) => bb.id === uc.id);
            if (foundBuilding) return foundBuilding.amount >= uc.amount;
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
    game.value.boughtUpgrades.push(newUpgrade);
    decrementPoints(newUpgrade.price);
  };

  return {
    upgradeList,
    initializeUpgradeMap,
    unlockedUpgrades,
    createBoughtUpgrade,
  };
});
