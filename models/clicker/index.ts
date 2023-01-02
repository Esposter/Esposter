export enum GeneralName {
  Mouse = "Mouse",
}

export enum CursorUpgradeName {
  "Reinforced Index Finger" = "Reinforced Index Finger",
  "Carpal Tunnel Prevention Cream" = "Carpal Tunnel Prevention Cream",
  Ambidextrous = "Ambidextrous",
  "Thousand Fingers" = "Thousand Fingers",
  "Million Fingers" = "Million Fingers",
  "Billion Fingers" = "Billion Fingers",
  "Trillion Fingers" = "Trillion Fingers",
  "Quadrillion Fingers" = "Quadrillion Fingers",
  "Quintillion Fingers" = "Quintillion Fingers",
  "Sextillion Fingers" = "Sextillion Fingers",
  "Septillion Fingers" = "Septillion Fingers",
  "Octillion Fingers" = "Octillion Fingers",
  "Nonillion Fingers" = "Nonillion Fingers",
  "Decillion Fingers" = "Decillion Fingers",
}

export const UpgradeName = { ...CursorUpgradeName };
export type UpgradeName = CursorUpgradeName;

export enum BuildingName {
  Cursor = "Cursor",
  Grandma = "Grandma",
}

export const Target = { ...GeneralName, ...UpgradeName, ...BuildingName };
export type Target = GeneralName | UpgradeName | BuildingName;

export enum EffectType {
  Additive = "Additive",
  Multiplicative = "Multiplicative",
  // Adds value based on number of specific buildings we have
  BuildingAdditive = "BuildingAdditive",
  // Considers all buildings except for buildings we specify
  BuildingAdditiveNor = "BuildingAdditiveNor",
  UpgradeMultiplier = "UpgradeMultiplier",
}

export interface EffectConfiguration {
  type: EffectType;
  // Only used for effect types that are based off other specific targets
  // e.g. BuildingAdditive requires number of buildings (targets)
  targets?: Target[];
}

export interface Effect {
  value: number;
  targets: Target[];
  configuration: EffectConfiguration;
}

export interface Upgrade {
  name: UpgradeName;
  description: string;
  flavorDescription: string;
  price: number;
  effects: Effect[];
}

export interface Building {
  name: BuildingName;
  flavorDescription: string;
  basePrice: number;
  baseValue: number;
}

export interface BuildingWithStats extends Building {
  amount: number;
  producedValue: number;
}

export interface Game {
  noPoints: number;
  boughtUpgrades: Upgrade[];
  boughtBuildings: BuildingWithStats[];
}
