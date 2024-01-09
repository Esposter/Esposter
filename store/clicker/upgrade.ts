import { type Upgrade } from "@/models/clicker/Upgrade";
import { decompileVariable } from "@/services/clicker/compiler/decompileVariable";
import { useGameStore } from "@/store/clicker/game";
import { usePointStore } from "@/store/clicker/point";

export const useUpgradeStore = defineStore("clicker/upgrade", () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const pointStore = usePointStore();
  const { decrementPoints } = pointStore;
  const clickerItemProperties = useClickerItemProperties();

  const upgradeList = ref<Upgrade[]>([]);
  const initialiseUpgradeList = (upgrades: Upgrade[]) => {
    upgradeList.value = upgrades;
  };
  const unlockedUpgrades = computed<Upgrade[]>(() =>
    upgradeList.value.filter((u) =>
      u.unlockConditions.every((uc) => {
        for (const boughtBuilding of game.value.boughtBuildings)
          if (boughtBuilding.name === uc.target) return boughtBuilding.amount >= uc.amount;

        for (const boughtUpgrade of game.value.boughtUpgrades) if (boughtUpgrade.name === uc.target) return true;

        return false;
      }),
    ),
  );

  const getDisplayDescription = (upgrade: Upgrade) => {
    const description = ref(decompileVariable(upgrade.description, clickerItemProperties.value));
    // watch(
    //   () => clickerItemProperties.value,
    //   (newClickerItemProperties) => {
    //     description.value = decompileVariable(upgrade.description, newClickerItemProperties);
    //   },
    // );
    return description;
  };
  const getDisplayFlavorDescription = (upgrade: Upgrade) => {
    const flavorDescription = ref(decompileVariable(upgrade.flavorDescription, clickerItemProperties.value));
    // watch(
    //   () => clickerItemProperties.value,
    //   (newClickerItemProperties) => {
    //     flavorDescription.value = decompileVariable(upgrade.flavorDescription, newClickerItemProperties);
    //   },
    // );
    return flavorDescription;
  };

  const createBoughtUpgrade = (newUpgrade: Upgrade) => {
    game.value.boughtUpgrades.push(newUpgrade);
    decrementPoints(newUpgrade.price);
  };

  return {
    upgradeList,
    initialiseUpgradeList,
    unlockedUpgrades,
    getDisplayDescription,
    getDisplayFlavorDescription,
    createBoughtUpgrade,
  };
});
