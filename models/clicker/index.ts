export const GeneralName = {
  Mouse: "Mouse",
} as const;
export type GeneralName = typeof GeneralName;
export type AGeneralName = GeneralName[keyof GeneralName];

export const UpgradeName = {
  "Reinforced Index Finger": "Reinforced Index Finger",
  "Carpal Tunnel Prevention Cream": "Carpal Tunnel Prevention Cream",
  Ambidextrous: "Ambidextrous",
  "Thousand Fingers": "Thousand Fingers",
} as const;
export type UpgradeName = typeof UpgradeName;
export type AUpgradeName = UpgradeName[keyof UpgradeName];

export const BuildingName = {
  Cursor: "Cursor",
} as const;
export type BuildingName = typeof BuildingName;
export type ABuildingName = BuildingName[keyof BuildingName];

export const UpgradeTarget = { ...GeneralName, ...UpgradeName, ...BuildingName };
export type UpgradeTarget = typeof UpgradeTarget;
export type AUpgradeTarget = UpgradeTarget[keyof UpgradeTarget];

export enum UpgradeType {
  Additive = "Additive",
  Multiplicative = "Multiplicative",
  // Adds value based on number of specific buildings we have
  BuildingAdditive = "BuildingAdditive",
  // Considers all buildings except for buildings we specify
  BuildingAdditiveNor = "BuildingAdditiveNor",
}

export interface UpgradeConfiguration {
  upgradeType: UpgradeType;
  // Only used for upgrade types that are based off other specific upgrade targets
  affectedUpgradeTargets?: AUpgradeTarget[];
}

export interface Upgrade {
  name: AUpgradeName;
  description: string;
  flavorDescription: string;
  price: number;
  value: number;
  upgradeTargets: AUpgradeTarget[];
  upgradeConfiguration: UpgradeConfiguration;
}

export interface Building {
  name: ABuildingName;
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
