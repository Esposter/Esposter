import type { BuildingWithStats, Effect, Upgrade } from "@/models/clicker";
import { EffectType, Target } from "@/models/clicker";

export const applyBuildingUpgrades = (
  basePower: number,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[]
) => {
  let resultPower = basePower;
  for (const boughtBuilding of boughtBuildings)
    resultPower += applyBuildingUpgradesSingle(boughtBuilding, boughtUpgrades, boughtBuildings);
  return resultPower;
};

export const applyBuildingUpgradesSingle = (
  building: BuildingWithStats,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[]
) => {
  const buildingUpgrades = boughtUpgrades.filter((u) => u.effects.some((e) => e.targets.includes(building.name)));
  return applyUpgrades(building.baseValue * building.level, buildingUpgrades, boughtBuildings);
};

export const applyMouseUpgrades = (basePower: number, boughtUpgrades: Upgrade[]) => {
  const mouseUpgrades = boughtUpgrades.filter((u) => u.effects.some((e) => e.targets.includes(Target.Mouse)));
  return applyUpgrades(basePower, mouseUpgrades);
};

const applyAdditiveEffects = (basePower: number, effects: Effect[]) => {
  let resultPower = basePower;

  const additiveEffects = effects.filter((e) => e.configuration.type === EffectType.Additive);
  for (const additiveEffect of additiveEffects) resultPower += additiveEffect.value;

  return resultPower;
};

const applyMultiplicativeEffects = (basePower: number, effects: Effect[]) => {
  let resultPower = basePower;

  const multiplicativeEffects = effects.filter((e) => e.configuration.type === EffectType.Multiplicative);
  for (const multiplicativeEffect of multiplicativeEffects) resultPower *= multiplicativeEffect.value;

  return resultPower;
};

const applyBuildingAdditiveEffects = (
  basePower: number,
  effects: Effect[],
  boughtBuildings: BuildingWithStats[] = []
) => {
  let resultPower = basePower;

  const buildingAdditiveEffects = effects.filter((e) => e.configuration.type === EffectType.BuildingAdditive);
  for (const buildingAdditiveEffect of buildingAdditiveEffects) {
    for (const target of buildingAdditiveEffect.configuration.targets ?? []) {
      const foundBuilding = boughtBuildings.find((b) => b.name === target);
      if (!foundBuilding) break;

      resultPower += buildingAdditiveEffect.value * foundBuilding.level;
    }
  }

  return resultPower;
};

const applyBuildingAdditiveNorEffects = (
  basePower: number,
  effects: Effect[],
  boughtBuildings: BuildingWithStats[] = []
) => {
  let resultPower = basePower;

  const buildingAdditiveNorEffects = effects.filter((e) => e.configuration.type === EffectType.BuildingAdditiveNor);
  for (const buildingAdditiveNorEffect of buildingAdditiveNorEffects) {
    const targets = buildingAdditiveNorEffect.configuration.targets ?? [];

    for (const boughtBuilding of boughtBuildings) {
      if (!targets.includes(boughtBuilding.name)) resultPower += buildingAdditiveNorEffect.value * boughtBuilding.level;
    }
  }

  return resultPower;
};

// Apply all upgrade multiplier effects to their specified targets
const applyUpgradeMultiplierEffects = (upgrades: Upgrade[]) => {
  const effects = upgrades.flatMap((u) => u.effects);
  const resultUpgrades: Upgrade[] = [];

  for (const upgrade of upgrades) {
    const resultUpgrade = applyUpgradeMultiplierEffectsSingle(upgrade, effects);
    resultUpgrades.push(resultUpgrade);
  }

  return resultUpgrades;
};

const applyUpgradeMultiplierEffectsSingle = (upgrade: Upgrade, effects: Effect[]): Upgrade => {
  const resultEffects: Effect[] = [];
  const upgradeMultiplierEffects = effects.filter(
    (e) => e.configuration.type === EffectType.UpgradeMultiplier && e.targets.includes(upgrade.name)
  );

  for (const effect of upgrade.effects) {
    let resultPower = effect.value;
    for (const upgradeMultiplierEffect of upgradeMultiplierEffects) resultPower *= upgradeMultiplierEffect.value;
    resultEffects.push({ ...effect, value: resultPower });
  }

  return { ...upgrade, effects: resultEffects };
};

export const applyUpgrades = (basePower: number, upgrades: Upgrade[], boughtBuildings: BuildingWithStats[] = []) => {
  let resultUpgrades = upgrades;
  resultUpgrades = applyUpgradeMultiplierEffects(resultUpgrades);

  const resultEffects = resultUpgrades.flatMap((u) => u.effects);

  let resultPower = basePower;
  resultPower = applyAdditiveEffects(resultPower, resultEffects);
  resultPower = applyMultiplicativeEffects(resultPower, resultEffects);
  resultPower = applyBuildingAdditiveEffects(resultPower, resultEffects, boughtBuildings);
  resultPower = applyBuildingAdditiveNorEffects(resultPower, resultEffects, boughtBuildings);
  return resultPower;
};
