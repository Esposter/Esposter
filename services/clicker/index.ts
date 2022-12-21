import type { Building, Upgrade } from "@/models/clicker";
import { UpgradeType } from "@/models/clicker";

export const applyBuildings = (power: number, buildings: Building[]) => {
  let resultPower = power;
  for (const building of buildings) resultPower += building.baseValue * building.level;
  return resultPower;
};

const applyAdditiveUpgrades = (power: number, upgrades: Upgrade[]) => {
  let resultPower = power;

  const additiveUpgrades = upgrades.filter((cu) => cu.upgradeConfiguration.upgradeType === UpgradeType.Additive);
  for (const additiveUpgrade of additiveUpgrades) resultPower += additiveUpgrade.value;

  return resultPower;
};

const applyMultiplicativeUpgrades = (power: number, upgrades: Upgrade[]) => {
  let resultPower = power;

  const additiveUpgrades = upgrades.filter((cu) => cu.upgradeConfiguration.upgradeType === UpgradeType.Additive);
  for (const additiveUpgrade of additiveUpgrades) resultPower += additiveUpgrade.value;

  return resultPower;
};

const applyBuildingAdditiveUpgrades = (power: number, upgrades: Upgrade[], boughtBuildings: Building[] = []) => {
  let resultPower = power;

  const buildingAdditiveUpgrades = upgrades.filter(
    (cu) => cu.upgradeConfiguration.upgradeType === UpgradeType.BuildingAdditive
  );
  for (const buildingAdditiveUpgrade of buildingAdditiveUpgrades) {
    for (const affectedUpgradeTarget of buildingAdditiveUpgrade.upgradeConfiguration.affectedUpgradeTargets ?? []) {
      const foundBuilding = boughtBuildings.find((b) => b.name === affectedUpgradeTarget);
      if (!foundBuilding) break;

      resultPower += buildingAdditiveUpgrade.value * foundBuilding.level;
    }
  }

  return resultPower;
};

const applyBuildingAdditiveNorUpgrades = (power: number, upgrades: Upgrade[], boughtBuildings: Building[] = []) => {
  let resultPower = power;

  const buildingAdditiveNorUpgrades = upgrades.filter(
    (cu) => cu.upgradeConfiguration.upgradeType === UpgradeType.BuildingAdditive
  );
  for (const buildingAdditiveNorUpgrade of buildingAdditiveNorUpgrades) {
    const affectedUpgradeTargets = buildingAdditiveNorUpgrade.upgradeConfiguration.affectedUpgradeTargets ?? [];

    for (const boughtBuilding of boughtBuildings) {
      if (!affectedUpgradeTargets.includes(boughtBuilding.name))
        resultPower += buildingAdditiveNorUpgrade.value * boughtBuilding.level;
    }
  }

  return resultPower;
};

export const applyUpgrades = (power: number, upgrades: Upgrade[], boughtBuildings: Building[] = []) => {
  let resultPower = power;
  resultPower = applyAdditiveUpgrades(resultPower, upgrades);
  resultPower = applyMultiplicativeUpgrades(resultPower, upgrades);
  resultPower = applyBuildingAdditiveUpgrades(resultPower, upgrades, boughtBuildings);
  resultPower = applyBuildingAdditiveNorUpgrades(resultPower, upgrades, boughtBuildings);
  return resultPower;
};
