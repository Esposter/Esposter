export enum GeneralName {
  Mouse = "Mouse",
}

export enum UpgradeName {
  "Reinforced Index Finger" = "Reinforced Index Finger",
  "Carpal Tunnel Prevention Cream" = "Carpal Tunnel Prevention Cream",
  Ambidextrous = "Ambidextrous",
  "Thousand Fingers" = "Thousand Fingers",
}

export enum BuildingName {
  Cursor = "Cursor",
}

export const UpgradeTarget = { ...GeneralName, ...UpgradeName, ...BuildingName };
export type UpgradeTarget = GeneralName | UpgradeName | BuildingName;

export enum UpgradeType {
  Additive = "Additive",
  Multiplicative = "Multiplicative",
  // Adds value based on number of specific buildings we have
  BuildingAdditive = "BuildingAdditive",
  // Considers all buildings except for buildings we specify
  BuildingAdditiveNor = "BuildingAdditiveNor",
  UpgradeMultiplier = "UpgradeMultiplier",
}

export interface UpgradeConfiguration {
  upgradeType: UpgradeType;
  // Only used for upgrade types that are based off other specific upgrade targets
  affectedUpgradeTargets?: UpgradeTarget[];
}

export interface Upgrade {
  name: UpgradeName;
  description: string;
  flavorDescription: string;
  price: number;
  value: number;
  upgradeTargets: UpgradeTarget[];
  upgradeConfiguration: UpgradeConfiguration;
}

export interface Building {
  name: BuildingName;
  flavorDescription: string;
  basePrice: number;
  baseValue: number;
  level: number;
}

export interface Game {
  noPoints: number;
  boughtUpgrades: Upgrade[];
  boughtBuildings: Building[];
}
