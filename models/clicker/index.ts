export enum UpgradeTarget {
  // General Upgrades
  Mouse = "Mouse",
  Building = "Building",
  // Specific Building Upgrades
  Cursor = "Cursor",
}

export type UpgradeName = UpgradeTarget;
export const UpgradeName = UpgradeTarget;

export enum UpgradeType {
  Additive = "Additive",
  Multiplicative = "Multiplicative",
}

export interface Upgrade {
  name: string;
  description: string;
  flavorDescription: string;
  price: number;
  value: number;
  upgradeTargets: UpgradeTarget[];
  upgradeType: UpgradeType;
}

export interface Building {
  name: UpgradeName;
  flavorDescription: string;
  basePrice: number;
  baseValue: number;
  level: number;
}

export interface Game {
  noPoints: number;
  boughtUpgradeList: Upgrade[];
  boughtBuildingList: Building[];
}
