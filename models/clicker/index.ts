export enum UpgradeTarget {
  Mouse = "Mouse",
  Cursor = "Cursor",
  Building = "Building",
}

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
  name: string;
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
