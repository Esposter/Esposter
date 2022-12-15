export enum UpgradeTarget {
  Cursor = "Cursor",
  AutoClick = "AutoClick",
}

export enum UpgradeLocation {
  General = "General",
  AutoClick = "AutoClick",
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
  upgradeLocation: UpgradeLocation;
  upgradeTargets: UpgradeTarget[];
  upgradeType: UpgradeType;
}

export interface Game {
  noPoints: number;
  boughtUpgradeList: Upgrade[];
}
