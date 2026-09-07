export enum EffectType {
  Additive = "Additive",
  // Adds value based on how many of the named buildings are owned
  BuildingAdditive = "BuildingAdditive",
  // Considers every building except the named ones
  BuildingAdditiveNor = "BuildingAdditiveNor",
  Multiplicative = "Multiplicative",
}

export const EffectTypes = Object.values(EffectType);
