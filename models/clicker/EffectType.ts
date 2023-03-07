export enum EffectType {
  Additive = "Additive",
  Multiplicative = "Multiplicative",
  // Adds value based on number of specific buildings we have
  BuildingAdditive = "BuildingAdditive",
  // Considers all buildings except for buildings we specify
  BuildingAdditiveNor = "BuildingAdditiveNor",
  UpgradeMultiplier = "UpgradeMultiplier",
}
