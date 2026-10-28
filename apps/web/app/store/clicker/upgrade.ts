import type { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";

import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { getUnlockedUpgrades } from "@/services/clicker/upgrade/getUnlockedUpgrades";
import { useClickerStore } from "@/store/clicker";
import { usePointStore } from "@/store/clicker/point";

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
  const unlockedUpgrades = computed<Upgrade[]>(() =>
    getUnlockedUpgrades(upgrades.value, clickerStore.clicker.boughtBuildings, clickerStore.clicker.boughtUpgrades),
  );

  const checkIsBought = (upgradeId: UpgradeId) =>
    clickerStore.clicker.boughtUpgrades.some(({ id }) => id === upgradeId);
  const availableUpgrades = computed(() => sortByPrice(unlockedUpgrades.value.filter(({ id }) => !checkIsBought(id))));
  const boughtUpgrades = computed(() => sortByPrice(clickerStore.clicker.boughtUpgrades));
  // An upgrade is bought once, and only with the points to pay for it
  const createBoughtUpgrade = (newUpgrade: Upgrade) => {
    if (!checkIsAffordable(newUpgrade.price) || checkIsBought(newUpgrade.id)) return;

    clickerStore.clicker.boughtUpgrades.push(newUpgrade);
    decrementPoints(newUpgrade.price);
  };

  return { availableUpgrades, boughtUpgrades, createBoughtUpgrade, initializeUpgradeMap, upgrades };
});
