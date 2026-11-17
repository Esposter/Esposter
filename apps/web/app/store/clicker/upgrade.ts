import type { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";

import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { getUnlockedUpgrades } from "#src/services/clicker/upgrade/getUnlockedUpgrades";
import { useClickerStore } from "#src/store/clicker/index";
import { usePointStore } from "#src/store/clicker/point";

const sortByPrice = (upgradesToSort: Upgrade[]) =>
  upgradesToSort.toSorted((firstUpgrade, secondUpgrade) => firstUpgrade.price - secondUpgrade.price);

export const useUpgradeStore = defineStore("clicker/upgrade", () => {
  const clickerStore = useClickerStore();
  const pointStore = usePointStore();
  const { checkIsAffordable, decrementPoints } = pointStore;
  const upgradeMap = ref<typeof UpgradeMap>();
  const upgrades = computed<Upgrade[]>(() => (upgradeMap.value ? parseDictionaryToArray(upgradeMap.value) : []));
  const initializeUpgradeMap = (newUpgradeMap: typeof UpgradeMap) => {
    upgradeMap.value = newUpgradeMap;
  };
  const checkIsBought = (upgradeId: UpgradeId) =>
    clickerStore.clicker.boughtUpgrades.some(({ id }) => id === upgradeId);
  // Unlocked is read only here, and it depends on every input the availability depends on, so its own cache would
  // Never be reused while this one is still clean
  const availableUpgrades = computed(() =>
    sortByPrice(
      getUnlockedUpgrades(
        upgrades.value,
        clickerStore.clicker.boughtBuildings,
        clickerStore.clicker.boughtUpgrades,
      ).filter(({ id }) => !checkIsBought(id)),
    ),
  );
  const boughtUpgrades = computed(() => sortByPrice(clickerStore.clicker.boughtUpgrades));
  // An upgrade is bought once, and only with the points to pay for it
  const createBoughtUpgrade = (newUpgrade: Upgrade) => {
    if (!checkIsAffordable(newUpgrade.price) || checkIsBought(newUpgrade.id)) return;

    clickerStore.clicker.boughtUpgrades.push(newUpgrade);
    decrementPoints(newUpgrade.price);
  };

  return { availableUpgrades, boughtUpgrades, createBoughtUpgrade, initializeUpgradeMap, upgrades };
});
